import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(({ mode }) => {
  const plugins = [] as PluginOption[];
  if (mode === 'production') {
    plugins.push({
      ...copy({
        hook: 'writeBundle',
        targets: [
          {
            dest: 'dist',
            src: 'src/*.d.ts',
          },
          {
            dest: 'dist/plugins',
            src: 'src/plugins/*.d.ts',
          },
        ],
      }),
    });
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/vite-plugin-wechat-mp.ts'),
        fileName: '[name]',
        formats: ['es', 'cjs'],
        name: 'VitePluginMp',
      },
      rollupOptions: {
        external: ['crypto', 'fs', 'path', 'rollup-plugin-copy', 'tinyglobby', 'vite'],
      },
    },
    plugins,
  };
});
