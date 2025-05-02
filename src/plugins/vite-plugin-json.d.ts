import type { Plugin } from 'vite';
export interface JsonPluginOptions {
    /**
     * Glob pattern(s) for JSON files or directories to exclude from processing.
     */
    jsonIgnore?: string | string[];
    /**
     * Glob pattern(s) for JSON files or directories to include in processing.
     */
    jsonInclude?: string | string[];
    /**
     * Root directory for resolving files.
     *
     * @default "miniprogram"
     */
    rootDir?: string;
}
export default function jsonPlugin(options?: JsonPluginOptions): Plugin;
