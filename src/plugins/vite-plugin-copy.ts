import type { Plugin } from 'vite';

import fs from 'fs';
import path from 'path';
import { glob } from 'tinyglobby';

const resolvedBy = 'vite-plugin-mp-copy';

export interface CopyPluginOptions {
  /**
   * If true, enables verbose logging of the copy process.
   *
   * @default false
   */
  debug?: boolean;

  /**
   * Output directory relative to project root.
   * All matched files will be copied into this directory.
   *
   * @default "dist"
   */
  outputDir?: string;

  /**
   * Root directory for resolving source and destination paths.
   * This is used as the base directory for globbing `src` and resolving `dest`.
   *
   * @default "miniprogram"
   */
  rootDir?: string;

  /**
   * List of copy targets, each specifying a glob pattern `src` and a destination directory `dest`.
   */
  targets?: CopyTarget[];
}

interface CopyTarget {
  /**
   * Relative destination directory within `rootDir` where matched files should be copied.
   */
  dest: string;

  /**
   * Glob pattern relative to `rootDir` for matching source files.
   */
  src: string;
}

export default function copyPlugin(options: CopyPluginOptions = {}): Plugin {
  const rootDir = options.rootDir ?? 'miniprogram';
  const outputDir = options.outputDir ?? 'dist';
  const debug = options.debug ?? false;
  const targets = options.targets ?? [];

  if (!Array.isArray(targets)) {
    throw new Error(`The "targets" option must be an array of objects with "src" and "dest" properties.`);
  }

  return {
    apply: 'build',
    async generateBundle() {
      if (targets.length === 0) {
        return;
      }

      const rootDirAbs = path.resolve(rootDir);
      const outputDirAbs = path.resolve(outputDir);

      const log = (msg: string) => {
        if (debug) {
          this.info(msg);
        }
      };

      for (const target of targets) {
        const { dest, src } = target;

        if (!src || !dest) {
          this.error(`Each target must have both "src" and "dest" properties.`);
        }

        try {
          const files = await glob(src, { cwd: rootDirAbs });
          log(`Found ${files.length} files for pattern "${src}"`);

          const srcBase = src.split('/')[0];
          log(`SrcBase: ${srcBase}`);

          let relativePath: string;
          let destPath: string;

          for (const file of files) {
            const srcPath = path.join(rootDirAbs, file);

            if (!srcBase || !file.startsWith(srcBase)) {
              relativePath = file;
            } else {
              relativePath = path.relative(srcBase, file);
            }

            destPath = path.join(outputDirAbs, dest, relativePath);

            log(`Copying: ${file}`);
            log(`SrcPath: ${srcPath}`);
            log(`DestPath: ${destPath}`);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
          }
        } catch (error) {
          this.error(
            `Failed to copy files from "${src}" to "${dest}": ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    },
    name: resolvedBy,
  };
}
