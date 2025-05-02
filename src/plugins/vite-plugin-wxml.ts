import type { Plugin, UserConfig } from 'vite';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { globSync } from 'tinyglobby';
import { mergeConfig, normalizePath } from 'vite';

const resolvedBy = 'vite-plugin-mp-wxml';
const WXML_PREFIX = 'wxml-';

export interface WxmlPluginOptions {
  /**
   * Custom function to compress HTML or Uint8Array input.
   *
   * The function should return a `string`, `Uint8Array`,
   * and can be asynchronous.
   *
   * @param html - The HTML content to be compressed.
   * @returns The compressed result as a `string`, `Uint8Array`.
   */
  compress?: (html: string | Uint8Array) => Promise<string | Uint8Array> | string | Uint8Array;

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

export default function wxmlPlugin(options: WxmlPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
  const outputDir = options.outputDir ?? 'miniprogram';
  const compress = options.compress;

  return {
    config(config: UserConfig) {
      const files = globSync(`${rootDir}/**/*.wxml`);

      const input = files.reduce(
        (acc, file) => {
          const relative = path.relative(rootDir, file).replace(/\.wxml$/, '');

          const hash = crypto.createHash('md5').update(file).digest('hex').slice(0, 8);
          const key = `${WXML_PREFIX}${relative}-${hash}`;

          acc[key] = path.resolve(file);
          return acc;
        },
        {} as Record<string, string>,
      );

      const pluginConfig: UserConfig = {
        build: {
          rollupOptions: {
            input,
            plugins: [
              {
                async generateBundle(_, bundle) {
                  for (const [fileName, file] of Object.entries(bundle)) {
                    if (file.type === 'asset' && fileName.endsWith('.html')) {
                      const relative = path.relative(rootDir, fileName).replace(/\.html$/, '.wxml');
                      const finalPath = normalizePath(path.join(outputDir, relative));
                      delete bundle[fileName];

                      let source = file.source;
                      if (typeof compress === 'function') {
                        source = await compress(source);
                      }

                      bundle[relative] = {
                        ...file,
                        fileName: finalPath,
                        source,
                      };
                    }
                  }
                },
                name: 'vite-plugin-html-rename',
              },
            ],
          },
        },
      };

      return mergeConfig(config, pluginConfig);
    },
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('.html')) {
        return null;
      }

      const wxmlPath = id.replace(/\.html$/, '.wxml');
      const code = await fs.promises.readFile(wxmlPath, 'utf-8');

      return {
        code,
        map: null,
        meta: {
          customData: {
            now: Date.now(),
            sourceFile: wxmlPath,
            type: 'wxml',
          },
        },
      };
    },
    name: resolvedBy,
    resolveId(source, importer) {
      if (!source.endsWith('.wxml')) {
        return null;
      }

      const baseDir = importer ? path.dirname(importer) : process.cwd();
      const resolvedPath = path.resolve(baseDir, source);

      return {
        external: false,
        id: resolvedPath.replace(/\.wxml$/, '.html'),
        meta: {
          customData: {
            fileName: resolvedPath,
            now: Date.now(),
            type: 'wxml',
          },
        },
        moduleSideEffects: true,
        resolvedBy,
      };
    },
  };
}
