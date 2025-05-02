import type { CopyPluginOptions } from './plugins/vite-plugin-copy';
import type { JsonPluginOptions } from './plugins/vite-plugin-json';
import type { WxJsPluginOptions } from './plugins/vite-plugin-wxjs';
import type { WxmlPluginOptions } from './plugins/vite-plugin-wxml';
import type { WxssPluginOptions } from './plugins/vite-plugin-wxss';
export interface IOptions extends CopyPluginOptions, JsonPluginOptions, WxJsPluginOptions, WxmlPluginOptions, WxssPluginOptions {
}
declare function MpPlugin(options?: IOptions): any[];
declare namespace MpPlugin {
    var resolvedBy: string;
}
export default MpPlugin;
