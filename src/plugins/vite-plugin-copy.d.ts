import type { Plugin } from 'vite';
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
     * @default "miniprogram"
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
export default function copyPlugin(options?: CopyPluginOptions): Plugin;
export {};
