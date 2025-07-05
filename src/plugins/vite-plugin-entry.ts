import type { LoggingFunction, NormalizedOutputOptions, OutputBundle, RollupLog } from 'rollup';
import type { Plugin, UserConfig } from 'vite';

import { mergeConfig } from 'vite';

const resolvedBy = 'vite-plugin-wechat-mp-entry';

export default function EntryPlugin(): Plugin {
  return {
    config(config: UserConfig) {
      const pluginConfig: UserConfig = {
        build: {
          rollupOptions: {
            input: { [resolvedBy]: resolvedBy },
            onwarn: (warning: RollupLog, warn: LoggingFunction) => {
              if (warning.names?.includes(resolvedBy)) {
                return;
              }

              const userOnwarn = config.build?.rollupOptions?.onwarn;
              if (typeof userOnwarn === 'function') {
                userOnwarn?.(warning, warn);
              } else if (userOnwarn) {
                warn(warning);
              }
            },
          },
        },
      };

      return mergeConfig(config, pluginConfig);
    },
    generateBundle(_options: NormalizedOutputOptions, bundle: OutputBundle) {
      for (const [key, value] of Object.entries(bundle)) {
        if (value.name === resolvedBy) {
          delete bundle[key];
          break;
        }
      }
    },
    load(id) {
      return id === resolvedBy ? '' : null;
    },
    name: resolvedBy,
    resolveId(id) {
      return id === resolvedBy ? id : null;
    },
  };
}
