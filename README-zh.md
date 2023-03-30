# complish
![license](https://img.shields.io/github/license/werifu/complish)
![release](https://img.shields.io/npm/v/complish?label=最新版本)

[English](./README.md) | [简体中文](./README-zh.md)

<h3 align="center">使用ChatGPT自动生成CLI的自动补全文件</h3>

Complish是一款用于为任何类型的CLI生成补全文件的工具，现在支持 __zsh__ 和 __fish__ 。

该工具使用chatGPT API解析CLI的帮助页面（执行`cmd --help`时打印出来的文本）并输出关于帮助页面的结构化信息。然后为特定的shell（如zsh或fish）生成补全脚本。

## 安装

```bash
npm i -g complish
```

需要OpenAI的API密钥，你可以通过设置环境变量或使用下面这条命令来设置密钥：

```bash
export OPENAI_API_KEY=your_openai_api_key
```

或者

```bash
complish set-key your_openai_api_key
```

如果没有密钥，你可以在[OpenAI](https://platform.openai.com/account/api-keys)申请一个，并记得保密！

## 使用

```bash
complish [options] [cmd]
```

### 在fish中的实例

生成名为`mycmd`的CLI的fish补全文件

```bash
complish mycmd --shell fish
```

当脚本执行完毕时，你会发现当前目录中存在`mycmd.fish`文件。

> 注意，执行速度受ChatGPT的响应时间限制，因此生成补全文件可能需要10秒到1分钟或更长时间。

将fish脚本复制到fish shell的补全目录中，即可自动加载文件。其他可用的fish补全目录可以在[这里](https://fishshell.com/docs/current/completions.html)找到

```bash
cp ./croc.fish ~/.config/fish/completions/
```

重新打开终端后，当您按下\<TAB\>时，您会发现补全已经生效!

![](./assets/mycmd-fish.png)

### 在zsh中的实例

生成名为`mycmd`的CLI的zsh补全文件。

```bash
complish mycmd --shell zsh
```

当脚本执行完成时，你会在当前目录发现一个名为`_mycmd`的zsh-completion格式的文件。然后将zsh补全文件复制到环境变量`$fpath`中的目录中。你可以在zsh中运行`echo $fpath`查看所有有效的目录。

```bash
cp ./_mycmd /Users/you/.zsh/functions
```

重新打开终端后，当您按下\<TAB\>时，您会发现补全已经生效！

![](./assets/mycmd-zsh.png)

## 开发

克隆此存储库。

```bash
git clone https://github.com/werifu/complish.git
```

我使用pnpm来管理依赖项:

安装依赖项:

```bash
pnpm i
```

编译TypeScript代码并运行已编译的JavaScript:

```bash
pnpm build
./dist/index.js
```

或者你可以直接使用ts-node运行它:

```bash
pnpm dev
```

## 贡献

欢迎Pull requests / issues! 请给我您的建议或其他反馈！😊

## TODO

* [ ] 支持bash补全（规划中）
* [ ] 减少API调用次数（此工具的瓶颈）
* [ ] 更详细的参数补全