import type { Plugin } from 'vite';
export interface TovwPluginOptions {
    /**
     * The width of the design draft in pixels.
     * Used as the base for converting `rpx` units to `vw`.
     * For example, with a design width of 750, 1rpx = (100 / 750) vw.
     *
     * @default 750
     */
    designWidth?: number;
    /**
     * Whether to enable automatic conversion from `rpx` to `vw`.
     * If set to true, the plugin will transform `rpx` units into `vw` during the build process.
     *
     * @default false
     */
    rpxToVw?: boolean;
}
export default function vitePluginToVw(options?: TovwPluginOptions): Plugin;
