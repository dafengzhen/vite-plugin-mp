import type { Plugin } from 'vite';
export interface WxssPluginOptions {
    /**
     * Root directory for resolving files.
     *
     * @default "miniprogram"
     */
    rootDir?: string;
}
export default function wxssPlugin(options?: WxssPluginOptions): Plugin;
