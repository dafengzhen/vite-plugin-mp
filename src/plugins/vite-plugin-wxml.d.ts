import type { Plugin } from 'vite';
export interface WxmlPluginOptions {
    /**
     * Custom function to compress HTML or Uint8Array input.
     *
     * The function should return a `string`, `Uint8Array`,
     * and can be asynchronous.
     *
     * @param html - The HTML content to be compressed.
     * @returns The compressed result as a `string`, `Uint8Array`.
     */
    compress?: (html: string | Uint8Array) => Promise<string | Uint8Array> | string | Uint8Array;
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
export default function wxmlPlugin(options?: WxmlPluginOptions): Plugin;
