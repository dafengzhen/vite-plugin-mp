import type { Plugin } from 'vite';
export interface WxssPluginOptions {
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
export default function wxssPlugin(options?: WxssPluginOptions): Plugin;
