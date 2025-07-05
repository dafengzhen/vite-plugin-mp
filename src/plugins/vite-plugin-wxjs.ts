import type { OutputOptions } from 'rollup';
import type { Plugin, UserConfig } from 'vite';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { globSync } from 'tinyglobby';
import { mergeConfig, normalizePath } from 'vite';

const resolvedBy = 'vite-plugin-wechat-mp-wxjs';
const WXJS_PREFIX = 'wxjs-';

export interface WxJsPluginOptions {
  /**
   * Whether this is a TypeScript project.
   *
   * @default true
   */
  isTsProject?: boolean;

  /**
   * Output directory for generated files.
   *
   * @default "miniprogram"
   */
  outputDir?: string;

  /**
   * Root directory for resolving files.
   *
   * @default "miniprogram"
   */
  rootDir?: string;
}

export default function wxJsPlugin(options: WxJsPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
  const outputDir = options.outputDir ?? 'miniprogram';
  const extensions = (options.isTsProject ?? true) ? 'ts' : 'js';

  return {
    config(config: UserConfig) {
      const files = globSync(`${rootDir}/**/*.${extensions}`);

      const input = files.reduce(
        (acc, file) => {
          const relative = path.relative(rootDir, file).replace(extensions === 'ts' ? /\.ts$/ : /\.js$/, '');

          const hash = crypto.createHash('md5').update(file).digest('hex').slice(0, 8);
          const key = `${WXJS_PREFIX}${relative}-${hash}`;

          acc[key] = path.resolve(file);
          return acc;
        },
        {} as Record<string, string>,
      );

      const userOutput = config?.build?.rollupOptions?.output as OutputOptions;
      const assetsDir = config?.build?.assetsDir ?? `${outputDir}/assets`;
      const target = config?.build?.target ?? ['es2015', 'chrome87', 'edge88', 'firefox78', 'safari14'];

      const pluginConfig: UserConfig = {
        build: {
          assetsDir,
          rollupOptions: {
            input,
            output: {
              entryFileNames: (chunkInfo) => {
                const name = chunkInfo.name;
                if (name.startsWith(WXJS_PREFIX)) {
                  const relative = name.substring(WXJS_PREFIX.length).replace(/-\w{8}$/, '.js');
                  return normalizePath(path.join(outputDir, relative));
                }

                const entryFileNames = userOutput?.entryFileNames;
                if (typeof entryFileNames === 'function') {
                  return entryFileNames(chunkInfo);
                } else if (typeof entryFileNames === 'string') {
                  return entryFileNames;
                } else {
                  return '[name].js';
                }
              },
              format: userOutput?.format ?? 'cjs',
            },
          },
          target,
        },
      };

      return mergeConfig(config, pluginConfig);
    },
    name: resolvedBy,
    transform(code, id) {
      if (!id.endsWith(`.${extensions}`)) {
        return null;
      }

      const ext = path.extname(id);
      const fileNameWithoutExt = path.basename(id, ext);
      const dirPath = path.dirname(id);

      const wxmlFile = `${fileNameWithoutExt}.wxml`;
      const wxssFile = `${fileNameWithoutExt}.wxss`;
      const jsonFile = `${fileNameWithoutExt}.json`;
      const imports = [];

      if (fs.existsSync(path.join(dirPath, wxmlFile))) {
        imports.push(`import './${wxmlFile}?raw';`);
      }

      if (fs.existsSync(path.join(dirPath, wxssFile))) {
        imports.push(`import './${wxssFile}?raw';`);
      }

      if (fs.existsSync(path.join(dirPath, jsonFile))) {
        imports.push(`import './${jsonFile}?raw';`);
      }

      if (imports.length === 0) {
        return null;
      }

      return {
        code: `${imports.join('\n')}\n${code}`,
        id,
      };
    },
  };
}
