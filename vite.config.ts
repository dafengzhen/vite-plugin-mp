import copy from 'rollup-plugin-copy';
import { defineConfig, type PluginOption } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const plugins = [] as PluginOption[];
  if (mode === 'production') {
    plugins.push({
      ...copy({
        hook: 'writeBundle',
        targets: [
          {
            src: 'src/main.d.ts',
            dest: 'dist',
          },
        ],
      }),
    });
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'VitePluginMp',
        fileName: '[name]',
      },
      rollupOptions: {
        external: [
          'vite',
          'glob',
          'fs',
          'path',
          'rollup-plugin-copy',
        ],
        output: {
          globals: {
            vite: 'vite',
            glob: 'glob',
            fs: 'fs',
            path: 'path',
            'rollup-plugin-copy': 'RollupPluginCopy',
          },
        },
        plugins: [],
      },
    },
    plugins,
  };
});
