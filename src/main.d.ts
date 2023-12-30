import { type PluginOption } from 'vite';
export interface IOptions {
    buildDir: string;
    outputDir: string;
    processedDir?: string[];
    processedAssetDir?: string[];
}
export default function VitePluginMp(options: IOptions): PluginOption;
