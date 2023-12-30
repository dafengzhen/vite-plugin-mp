import { normalizePath, type PluginOption } from 'vite';
import { globSync } from 'glob';
import type { OutputAsset, OutputChunk, OutputOptions } from 'rollup';
import fs from 'fs';
import path from 'path';
import RollupPluginCopy from 'rollup-plugin-copy';

export interface IOptions {
  buildDir: string;
  outputDir: string;
  processedDir?: string[];
  processedAssetDir?: string[];
}

export default function VitePluginMp(options: IOptions): PluginOption {
  if (!options || !options.buildDir || !options.outputDir) {
    throw new Error('Required options cannot be empty');
  }

  const _options = {
    buildDir: normalizePath(options.buildDir),
    outputDir: normalizePath(options.outputDir),
  };
  const _processedDir = [
    'apis',
    'components',
    'constants',
    'pages',
    'tools',
  ].concat(options.processedDir ?? []);
  const _processedAssetDir = ['assets'].concat(options.processedAssetDir ?? []);

  const inputs = globSync([
    `${_options.buildDir}/{${_processedDir.join(
      ',',
    )}}/**/*.{json,wxml,scss,ts}`,
    `${_options.buildDir}/{app,config,sitemap}.{json,wxml,scss,ts}`,
    `${path.dirname(_options.buildDir)}/project.config.json`,
    `${path.dirname(_options.buildDir)}/project.private.config.json`,
  ]).map((item) => {
    const n = normalizePath(item);
    if (item.endsWith('.json') || item.endsWith('.wxml')) {
      return n + '?raw';
    }
    return n;
  });

  return [
    {
      name: 'vite-plugin-mp',
      config() {
        return {
          build: {
            cssCodeSplit: false,
            rollupOptions: {
              input: inputs,
              output: {
                dir: _options.outputDir,
                assetFileNames(chunkInfo) {
                  if (
                    chunkInfo.name === 'style.css' &&
                    chunkInfo.source !== '/* vite internal call, ignore */'
                  ) {
                    return normalizePath(
                      path.join(path.basename(_options.buildDir), 'app.wxss'),
                    );
                  }

                  return 'assets/[name]-[hash][extname]';
                },
                entryFileNames(chunkInfo) {
                  const facadeModuleId = chunkInfo.facadeModuleId ?? '';
                  if (inputs.includes(facadeModuleId)) {
                    let filepath;
                    if (facadeModuleId.endsWith('.ts')) {
                      filepath = facadeModuleId.replace(
                        _options.buildDir,
                        path.basename(_options.buildDir),
                      );
                    } else {
                      filepath = facadeModuleId
                        .replace('?raw', '')
                        .replace(
                          _options.buildDir,
                          path.basename(_options.buildDir),
                        )
                        .replace(path.dirname(_options.buildDir), '');
                    }

                    if (filepath.endsWith('.ts')) {
                      filepath = filepath.replace('.ts', '.js');
                    } else if (filepath.endsWith('.scss')) {
                      filepath = filepath.replace('.scss', '.wxss');
                    }

                    return filepath.startsWith('/')
                      ? filepath.substring(1)
                      : filepath;
                  }

                  return '[name].js';
                },
              },
            },
          },
        };
      },
      async transform(code, id) {
        if (inputs.includes(id)) {
          if (id.endsWith('?raw')) {
            return 'internal';
          }

          return {
            code,
            map: null,
          };
        }

        return;
      },
      async generateBundle(
        _: OutputOptions,
        bundle: { [fileName: string]: OutputAsset | OutputChunk },
      ) {
        const removedList: string[] = [];
        for (const key in bundle) {
          const value = bundle[key];

          if (value.type === 'chunk') {
            const facadeModuleId = value.facadeModuleId ?? '';
            if (inputs.includes(facadeModuleId)) {
              if (!facadeModuleId.endsWith('.ts')) {
                const filepath = facadeModuleId.replace('?raw', '');

                if (facadeModuleId.endsWith('app.scss')) {
                  removedList.push(key);
                  continue;
                }

                value.code = fs.readFileSync(filepath, 'utf8');
              }
            }
          }
        }

        removedList.forEach((key) => delete bundle[key]);
      },
    },
    {
      name: 'vite-plugin-mp-assets',
      async buildStart() {
        const p =
          _processedAssetDir.length === 1
            ? _processedAssetDir[0]
            : `{${_processedAssetDir.join(',')}}`;

        const files = globSync([`${_options.buildDir}/${p}/**/*`]);
        for (const file of files) {
          this.addWatchFile(normalizePath(file));
        }
      },
    },
    {
      ...RollupPluginCopy({
        hook: 'closeBundle',
        targets: _processedAssetDir.map((dir) => ({
          src: normalizePath(path.join(_options.buildDir, dir)),
          dest: normalizePath(
            path.join(_options.outputDir, path.basename(_options.buildDir)),
          ),
        })) as any[],
      }),
    },
  ];
}
