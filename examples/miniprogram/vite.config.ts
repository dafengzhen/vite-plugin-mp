import VitePluginWechatMp from 'vite-plugin-wechat-mp';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    reportCompressedSize: false,
  },
  plugins: [VitePluginWechatMp()],
});
