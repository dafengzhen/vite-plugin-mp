import type { Plugin } from 'vite';

import fs from 'fs';
import path from 'path';
import { globSync } from 'tinyglobby';
import { normalizePath } from 'vite';

const resolvedBy = 'vite-plugin-wechat-mp-json';

export interface JsonPluginOptions {
  /**
   * Glob pattern(s) for JSON files or directories to exclude from processing.
   */
  jsonIgnore?: string | string[];

  /**
   * Glob pattern(s) for JSON files or directories to include in processing.
   */
  jsonInclude?: string | string[];

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

export default function jsonPlugin(options: JsonPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
  const outputDir = options.outputDir ?? 'miniprogram';
  const include = options.jsonInclude;
  const ignore = options.jsonIgnore;
  const files: string[] = [];

  return {
    buildStart() {
      const pattern = [`${rootDir}/**/*.json`, 'project.config.json'];

      if (typeof include === 'string') {
        pattern.push(include);
      } else if (Array.isArray(include)) {
        pattern.push(...include);
      }

      files.push(
        ...globSync(pattern, {
          ignore,
        }),
      );
    },
    async generateBundle() {
      try {
        await Promise.all(
          files.map(async (file) => {
            try {
              const content = await fs.promises.readFile(file, 'utf-8');
              const parsed = JSON.parse(content);
              const minified = JSON.stringify(parsed);

              const isInRoot = file.startsWith(rootDir);
              const relative = isInRoot ? path.relative(rootDir, file) : file;
              const finalPath = isInRoot ? normalizePath(path.join(outputDir, relative)) : relative;

              this.emitFile({
                fileName: finalPath,
                source: minified,
                type: 'asset',
              });
            } catch (error) {
              this.warn(`Failed to process ${file}: ${error instanceof Error ? error.message : error}`);
            }
          }),
        );
      } catch (error) {
        this.error(`Failed to find JSON files: ${error instanceof Error ? error.message : error}`);
      }
    },
    name: resolvedBy,
  };
}
