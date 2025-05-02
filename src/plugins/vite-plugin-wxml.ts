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

const isUint8Array = (input: string | Uint8Array): input is Uint8Array => {
  return Object.prototype.toString.call(input) === '[object Uint8Array]';
};

const decodeIfUint8Array = (input: string | Uint8Array): { text: string; wasBinary: boolean } => {
  if (isUint8Array(input)) {
    return { text: new TextDecoder('utf-8').decode(input), wasBinary: true };
  }
  return { text: input, wasBinary: false };
};

const processSource = async (
  input: string | Uint8Array,
  fileKeys: string[],
  compress?: (html: string | Uint8Array) => Promise<string | Uint8Array> | string | Uint8Array,
): Promise<string | Uint8Array> => {
  const { text, wasBinary } = decodeIfUint8Array(input);

  let processed: string | Uint8Array = stripScriptBlocks(text, fileKeys);

  if (typeof compress === 'function') {
    const result = wasBinary ? compress(new TextEncoder().encode(processed)) : compress(processed);
    if (result instanceof Promise) {
      processed = await result;
    } else {
      processed = result;
    }
  }

  return processed;
};

const stripScriptBlocks = (source: string, keys: string[]): string => {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  return source.replaceAll(scriptRegex, (match) => {
    return keys.some((key) => match.includes(key)) ? '' : match;
  });
};

export default function wxmlPlugin(options: WxmlPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
  const outputDir = options.outputDir ?? 'miniprogram';
  const compress = options.compress;
  const fileKeys: string[] = [];

  return {
    config(config: UserConfig) {
      const files = globSync(`${rootDir}/**/*.wxml`);

      const input = files.reduce(
        (acc, file) => {
          const relative = path.relative(rootDir, file).replace(/\.wxml$/, '');

          const hash = crypto.createHash('md5').update(file).digest('hex').slice(0, 8);
          const key = `${WXML_PREFIX}${relative}-${hash}`;

          fileKeys.push(`${key}.js`);
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

                      const source = await processSource(file.source, fileKeys, compress);
                      bundle[relative] = {
                        ...file,
                        fileName: finalPath,
                        source,
                      };
                    } else if (file.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith(WXML_PREFIX)) {
                      delete bundle[fileName];
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
