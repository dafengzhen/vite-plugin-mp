# 使用 Vite 编译微信小程序

当你想使用原生微信小程序开发，不想使用其他框架进行开发，只想简单的使用 Vite 进行编译打包，那么这就是该插件用途

注意使用版本，该插件测试的为微信小程序基于 Skyline 渲染引擎的 Ts + Scss 模板，以及 Vite 5

# 安装依赖

```bash
npm install -D glob rollup-plugin-copy @dafengzhen/vite-plugin-mp
```

# 使用插件

- **编辑 ```vite.config.ts``` 文件**

```javascript
import path from "path";
import VitePluginMp from '@dafengzhen/vite-plugin-mp';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [
        VitePluginMp({
            buildDir: path.resolve(__dirname, 'miniprogram'),
            outputDir: path.resolve(__dirname, 'dist')
        })
    ]
})
```

- **构建编译小程序**

```bash
npm run build
```

- **输入输出示例**

这里省略多余的文件，只展示关键信息

输入的代码结构：

```text
├── ...
├── miniprogram
│   ├── apis
│   │   └── test
│   │       └── index.ts
│   ├── app.json
│   ├── app.scss
│   ├── app.ts
│   ├── assets
│   │   ├── images
│   │   │   ├── test.png
│   ├── components
│   │   └── navigation-bar
│   │       ├── navigation-bar.json
│   │       ├── navigation-bar.scss
│   │       ├── navigation-bar.ts
│   │       └── navigation-bar.wxml
│   ├── constants
│   │   └── index.ts
│   ├── interfaces
│   │   └── index.ts
│   ├── pages
│   │   ├── index
│   │   │   ├── index.json
│   │   │   ├── index.scss
│   │   │   ├── index.ts
│   │   │   └── index.wxml
│   ├── sitemap.json
│   └── tools
│       ├── index.ts
│       ├── request.ts
│       └── upload-request.ts
├── project.config.json
├── project.private.config.json
└── ...
```

输出的代码结构：

```text
├── ...
├── dist
│   ├── miniprogram
│   │   ├── apis
│   │   │   └── test
│   │   │       └── index.js
│   │   ├── app.js
│   │   ├── app.json
│   │   ├── app.wxss
│   │   ├── assets
│   │   │   ├── images
│   │   │   │   ├── test.png
│   │   ├── components
│   │   │   └── navigation-bar
│   │   │       ├── navigation-bar.js
│   │   │       ├── navigation-bar.json
│   │   │       ├── navigation-bar.wxml
│   │   │       └── navigation-bar.wxss
│   │   ├── constants
│   │   │   └── index.js
│   │   ├── pages
│   │   │   ├── index
│   │   │   │   ├── index.js
│   │   │   │   ├── index.json
│   │   │   │   ├── index.wxml
│   │   │   │   └── index.wxss
│   │   ├── sitemap.json
│   │   └── tools
│   │       ├── index.js
│   │       ├── request.js
│   │       └── upload-request.js
│   ├── project.config.json
│   └── project.private.config.json
└── ...
```

# 插件选项

- **buildDir** 必填。编译小程序的代码目录
- **outputDir** 必填。输出编译小程序的代码目录
- **processedDir** 可选。要处理的代码文件夹名称，默认为 ```['apis', 'components', 'constants', 'pages', 'tools']```
- **processedAssetDir** 可选。要处理的资源文件夹名称，默认为 ```['assets']```

# 其他相关

- 当不要想使用该插件，如何将原来代码转换为使用 Uni-App / Taro 等框架开发

该插件使用的对象为微信原生小程序，意味着如果需要转化为其他框架，可以从 "微信原生小程序如何转换 XXX 框架" 为出发点，这是一种方式

另一种方式是使用框架本身提供的转换工具，尝试转换微信小程序，例如 [Uni-App 转换工具指南](https://zh.uniapp.dcloud.io/translate.html) 等

- 当使用该插件遇到无法编译，或者发生未知错误，想改为原来的微信小程序需要如何做

首先要做的是移除该插件，因为该插件本质上只是使用 vite 来对文件进行编译而已

其次，即使不使用 Vite，微信开发者工具也能进行编译，除此之外没有太大区别

移除该插件后，剩下的就是熟悉的微信小程序代码

# License

[MIT](https://opensource.org/licenses/MIT)
