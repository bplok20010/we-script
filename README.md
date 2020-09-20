# we-script

支持加载远程 JavaScript 脚本并执行，**支持 ES5 语法**

示例：

[we-script-demo](https://github.com/bplok20010/we-script-demo)

## Usage

> 小程序如何使用 npm 包，官方文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html

```sh
npm install --save we-script
```

**step1 安装完成后，点击开发者工具中的菜单栏：工具 --> 构建 npm**

**step2 安装完成后，点击开发者工具中的菜单栏：工具 --> 项目详情 --> 本地设置 --> [勾选] 使用 npm 模块**

在需要用的页面或组件的`json`文件添加声明，示例：

`index.json`

```ts
{
  "usingComponents": {
    "we-script": "we-script"
  }
}
```

`index.wxml`

```html
<we-script src="url">
  <view>hello we-script<view>
</we-script>
```

**注**：多个`we-script`会并行加载及无序执行，无法保证执行顺序。如：

```html
// 并行加载及无序执行
<we-script src="url1" />
<we-script src="url2" />
<we-script src="url3" />
```

**如需要确保执行顺序，应该使用数组，例如：**

**数组方式**

```html
<we-script src="{{[url1,url2,url3]}}">
  <view>hello we-script<view>
</we-script>
```

`we-script`也支持嵌套，如：

```html
<we-script  src="url1">
  <we-script src="url2">
    <view>hello we-script<view>
  </we-script>
</we-script>
```

**注意：** 在嵌套的情况下`we-script`加载和执行也是并行且无序的，因为小程序生命周期触发机制(BUG?)导致，如果想在嵌套模式下保证顺序，需要自己手动控制，示例：

```html
<we-script bind:onLoad="loadScript" src="url1">
  <we-script wx:if="url1_load_success" src="url2">
    <view>hello we-script<view>
  </we-script>
</we-script>
```

**重要：** 远程加载执行的代码所生成的函数，变量等数据存储在`we-script`默认的`上下文`中，可通过`onLoad`事件获取默认`上下文`，或通过`onInit`事件自定义`上下文`。

示例：

[we-script-demo](https://github.com/bplok20010/we-script-demo)

## we-script 属性

- ### `src`

  类型：`string | string[]`

  要加载的远程脚本

- ### `text`

  类型：`string | string[]`

  需要执行的 JavaScript 脚本字符串，`text` 优先级高于 `src` (互斥)

- ### `timeout`

  类型：`number`
  默认值：`60000` 毫秒

  设置每个远程脚本加载超时时间

- ### `cache`

  类型：`boolean`

  默认值：`true`

  是否启用加载缓存，缓存策略是以当前请求地址作为`key`，缓存周期为当前用户在使用期间的生命周期。

- ### `once`

  类型：`boolean`

  默认值：`true`

  相同上下文及相同地址的脚本只执行一次。

## we-script 事件

- ### `onInit`

  类型：`(e) => void`

  ```ts
  interface OnInitDetail {
  	getContext: () => {};
  	setContext: (context: {}) => void;
  }
  ```

  初始事件，监听该事件可获取当前执行上下文或自定义执行上下文。

  示例：

  ```ts
  // index.js
  {
    onInit(e){
      // 自定义执行上下文
      e.detail.setContext({
        value: 100
      })
    }
  }
  // index.wxml
  <we-script src="url" bind:onInit="onInit" />
  ```

- ### `onLoad`

  类型：`(e) => void`

  ```ts
  interface onLoadDetail {
  	context: {};
  }
  ```

  加载并执行成功后触发

- ### `onError`

  类型：`(e) => void`

  ```ts
  interface onErrorDetail {
  	error: any;
  }
  ```

  加载失败或执行错误后触发

## 其他

- 该组件使用[eval5](https://github.com/bplok20010/eval5)来解析`JavaScript`语法，支持 `ES5`

- **上生产环境前别忘记给需要加载的地址配置合法域名**

- `we-script` 内置类型及方法：

```ts
NaN;
Infinity;
undefined;
null;
Object;
Array;
String;
Boolean;
Number;
Date;
RegExp;
Error;
URIError;
TypeError;
RangeError;
SyntaxError;
ReferenceError;
Math;
parseInt;
parseFloat;
isNaN;
isFinite;
decodeURI;
decodeURIComponent;
encodeURI;
encodeURIComponent;
escape;
unescape;
eval;
Function;
console;
setTimeout;
clearTimeout;
setInterval;
clearInterval;
wx;
```

> 内置类型和当前运行 JavaScript 环境相关，如环境本身不支持则不支持！
