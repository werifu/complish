# complish
![license](https://img.shields.io/github/license/werifu/complish)
![release](https://img.shields.io/github/v/release/werifu/complish)

[English](./README.md) | [简体中文](./README-zh.md)

<h3 align="center">Generate completion file for your CLI in fish-shell via chatGPT.</h3>

Complish is a tool to generate fish-completion file for any type of CLI.

The tool uses chatGPT API to parse the help page of a CLI (the text printed when executing `cmd --help`) and output structured information about this help page.
Then generate a fish completion script, for details of fish completion, see [fish-completion](https://fishshell.com/docs/current/completions.html).

Not using Fish shell now? I strongly recommend it! https://fishshell.com/

## Installing

```bash
npm i -g complish
```

## Usage

```bash
complish [options] [cmd]
```

Environment OPENAI_API_KEY is needed first. If you have no the key, you can apply for one on [OpenAI](https://platform.openai.com/account/api-keys) and remember to keep secret!
```bash
export OPENAI_API_KEY=your_openai_api_key
```

Example:

Generate completion for famous file-tranfer tool [croc](https://github.com/schollz/croc).
```bash
complish croc
```
And you will find croc.fish in your current directory when the script finished. 

> Note that the execution speed is limited by the response time of ChatGPT, so it may take 10 seconds to 1 minute or more to generate completion file.

Then copy the fish script to the completions directory of fish shell for which the file can be automatically loaded. Other available directories can see [here](https://fishshell.com/docs/current/completions.html)

```bash
cp ./croc.fish ~/.config/fish/completions/
source
```

At last you will find the completion works when you press \<TAB\>

![](./assets/croc-complete.png)
## Development

Clone this repo.

```bash
git clone https://github.com/werifu/complish.git
```

I use pnpm to manage dependencies:

Install dependencies:
```bash
pnpm i
```

Compile TypeScript code and run the compiled JavaScript:
```bash
pnpm build
./dist/index.js
```

or you can run it using ts-node directly:

```bash
pnpm dev
```

## Contribute

Pull requests / issues are both welcome! 

Please give me your suggestions! 😊

## TODO

* [ ] Text clip (too long help page cannot be handled by chatGPT)
* [ ] Reduce API calling times (bottle neck of this tool)
* [ ] More detail arguments completion (now only using --require-parameter)