import VitePluginMp from '@dafengzhen/vite-plugin-mp';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    reportCompressedSize: false,
  },
  plugins: [VitePluginMp()],
});
