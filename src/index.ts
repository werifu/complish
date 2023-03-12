#!/usr/bin/env node
import { isCmdChainFunc } from './completion';
import { execAndHandle } from './handle';
import { program } from 'commander';
import * as fs from 'fs/promises';
import logger, { setLogLevel } from './logger';
import { OPENAI_API_KEY } from './openai';

const VERSION = require('../package.json').version;

program
  .name('complish')
  .version(VERSION)
  .addHelpText('beforeAll', 'Copyright (C) 2023 Werifu\n')
  .addHelpText(
    'before',
    'Complish is a tool to generate fish-completion script file with the help of chatGPT API.\n'
  )
  .usage('[options] [cmd]')
  .option('-h, --help', 'print this help page')
  .option('-o, --outfile <file>', 'output file, default: <cmd>.fish')
  .option('-d, --debug', 'print debug information')
  .argument(
    '[cmd]',
    'the command you want to complete in fish, absolute path also supported.'
  )
  .addHelpText('after', '\nEnvironment varible OPENAI_API_KEY is needed.')
  .action(main)
  .parse();

async function main(cmd: string) {
  const { help, outfile, debug } = program.opts();

  if (debug) {
    logger.info('set log level: debug');
    setLogLevel('debug');
  }

  logger.debug(JSON.stringify(program.opts()));
  // -h or (no command and no options)
  if (help || (!cmd && Object.keys(program.opts()).length === 0)) {
    return program.help();
  }

  if (!OPENAI_API_KEY) {
    logger.error(
      'OPENAI_API_KEY not found in your env! \nPlease run `export OPENAI_API_KEY=your_api_key` before running complish'
    );
    return;
  }

  if (!cmd) {
    logger.error('argument cmd needed.');
    return;
  }

  console.time('Exec time:');
  const script = (await execAndHandle(cmd, [])).map((line) =>
    // $VAR in completion should be string "$VAR" instead of value of a variable
    line.replaceAll('$', '\\$')
  );
  logger.info('\n------------parse finish!-----------\n');

  const code = [isCmdChainFunc, ...script].join('\n');

  // write to file
  const finalOutfile: string =
    outfile ?? `${cmd.includes('/') ? cmd.split('/').reverse()[0] : cmd}.fish`;
  logger.info(`Writing to ${finalOutfile}...`);
  try {
    await fs.writeFile(finalOutfile, code);
  } catch (e) {
    // fail to write file, directly print
    logger.error(e);
    console.log(`code:\n${code}`);
  }
  logger.info('\n------------write finish!-----------\n');
  console.timeLog('Exec time:');
}
