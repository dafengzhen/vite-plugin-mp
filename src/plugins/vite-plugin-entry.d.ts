import type { Plugin } from 'vite';
export interface EntryPluginOptions {
    /**
     * Root directory for resolving files.
     *
     * @default "miniprogram"
     */
    rootDir?: string;
}
export default function EntryPlugin(): Plugin;
