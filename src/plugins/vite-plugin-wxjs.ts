import type { OutputOptions } from 'rollup';
import type { Plugin, UserConfig } from 'vite';

import crypto from 'crypto';
import path from 'path';
import { globSync } from 'tinyglobby';
import { mergeConfig } from 'vite';

const resolvedBy = 'vite-plugin-mp-wxjs';
const WXJS_PREFIX = 'wxjs-';

export interface WxJsPluginOptions {
  /**
   * Whether this is a TypeScript project.
   *
   * @default true
   */
  isTsProject?: boolean;

  /**
   * Root directory for resolving files.
   *
   * @default "miniprogram"
   */
  rootDir?: string;
}

export default function wxJsPlugin(options: WxJsPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
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

      const pluginConfig: UserConfig = {
        build: {
          rollupOptions: {
            input,
            output: {
              entryFileNames: (chunkInfo) => {
                const name = chunkInfo.name;
                if (name.startsWith(WXJS_PREFIX)) {
                  return name.substring(WXJS_PREFIX.length).replace(/-\w{8}$/, '.js');
                }

                const entryFileNames = (config?.build?.rollupOptions?.output as OutputOptions)?.entryFileNames;
                if (typeof entryFileNames === 'function') {
                  return entryFileNames(chunkInfo);
                } else if (typeof entryFileNames === 'string') {
                  return entryFileNames;
                } else {
                  return '[name].js';
                }
              },
            },
          },
        },
      };

      return mergeConfig(config, pluginConfig);
    },
    name: resolvedBy,
  };
}
