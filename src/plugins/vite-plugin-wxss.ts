import type { OutputOptions } from 'rollup';
import type { Plugin, UserConfig } from 'vite';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { globSync } from 'tinyglobby';
import { mergeConfig } from 'vite';

const resolvedBy = 'vite-plugin-mp-wxss';
const WXSS_PREFIX = 'wxss-';

export interface WxssPluginOptions {
  /**
   * Root directory for resolving files.
   *
   * @default "miniprogram"
   */
  rootDir?: string;
}

export default function wxssPlugin(options: WxssPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';

  return {
    config(config: UserConfig) {
      const files = globSync(`${rootDir}/**/*.wxss`);

      const input = files.reduce(
        (acc, file) => {
          const relative = path.relative(rootDir, file).replace(/\.wxss$/, '');

          const hash = crypto.createHash('md5').update(file).digest('hex').slice(0, 8);
          const key = `${WXSS_PREFIX}${relative}-${hash}`;

          acc[key] = path.resolve(file);
          return acc;
        },
        {} as Record<string, string>,
      );

      const pluginConfig: UserConfig = {
        build: {
          rollupOptions: {
            input,
            output: {
              assetFileNames: (chunkInfo) => {
                const name = chunkInfo.names?.[0];
                if (name?.startsWith(WXSS_PREFIX)) {
                  return name.substring(WXSS_PREFIX.length).replace(/-\w{8}.css$/, '.wxss');
                }

                const assetFileNames = (config?.build?.rollupOptions?.output as OutputOptions)?.assetFileNames;
                if (typeof assetFileNames === 'function') {
                  return assetFileNames(chunkInfo);
                } else if (typeof assetFileNames === 'string') {
                  return assetFileNames;
                } else {
                  return 'assets/[name]-[hash][extname]';
                }
              },
            },
          },
        },
      };

      return mergeConfig(config, pluginConfig);
    },
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('.css')) {
        return null;
      }

      const wxssPath = id.replace(/\.css$/, '.wxss');
      const code = fs.readFileSync(wxssPath, 'utf-8');

      return {
        code,
        map: null,
        meta: {
          customData: {
            now: Date.now(),
            sourceFile: wxssPath,
            type: 'wxss',
          },
        },
      };
    },
    name: resolvedBy,
    resolveId(source, importer) {
      if (!source.endsWith('.wxss')) {
        return null;
      }

      const baseDir = importer ? path.dirname(importer) : process.cwd();
      const resolvedPath = path.resolve(baseDir, source);

      return {
        external: false,
        id: resolvedPath.replace(/\.wxss$/, '.css'),
        meta: {
          customData: {
            fileName: resolvedPath,
            now: Date.now(),
            type: 'wxss',
          },
        },
        moduleSideEffects: true,
        resolvedBy,
      };
    },
  };
}
