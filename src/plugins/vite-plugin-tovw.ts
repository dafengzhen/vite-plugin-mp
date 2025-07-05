import type { Plugin } from 'vite';

const resolvedBy = 'vite-plugin-wechat-mp-tovw';

const rpxToVw = (css: string, designWidth = 750): string => {
  return css.replace(/:\s*([^;{}]+)rpx/g, (match) => {
    return match.replace(/(\d+(\.\d+)?)rpx/g, (_, value) => {
      const number = parseFloat(value);
      const vw = (number / designWidth) * 100;
      return `${vw.toFixed(3)}vw`;
    });
  });
};

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

export default function vitePluginToVw(options: TovwPluginOptions = {}): Plugin {
  const enable = options.rpxToVw ?? false;
  const designWidth = options.designWidth ?? 750;

  return {
    name: resolvedBy,
    transform(code, id) {
      if (enable && id.endsWith('.css')) {
        if (!code.includes('rpx')) {
          return null;
        }

        return {
          code: rpxToVw(code, designWidth),
          map: null,
        };
      }
      return null;
    },
  };
}
