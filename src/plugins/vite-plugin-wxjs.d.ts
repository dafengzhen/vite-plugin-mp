import type { Plugin } from 'vite';
export interface WxJsPluginOptions {
    /**
     * Whether this is a TypeScript project.
     *
     * @default true
     */
    isTsProject?: boolean;
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
export default function wxJsPlugin(options?: WxJsPluginOptions): Plugin;
