import { spawn } from 'child_process';
import {
  cmdOptionCompletion,
  disableFileCompletion,
  isCmdChainFunc,
  subCmdCompletion,
} from './completion';
import { makeFnParseHelpText } from './openai';
import { retry } from './utils/retry';
import logger from './logger';
import { exit } from 'process';

/**
 * wrap spawn to a Promise, resolve when getting text from `cmd -h`
 * @param cmd 
 * @param subCmds 
 * @returns script lines
 */
export async function execAndHandle(cmd: string, subCmds: string[]) {
  return new Promise((resolve: (completions: string[]) => void, _) => {
    const args = subCmds ? [...subCmds, '--help'] : ['--help'];
    const child = spawn(cmd, args);
    const chunks: any[] = [];
    child.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });
    child.on('close', async (_) => {
      const data = Buffer.concat(chunks);
      const res = await handleHelpPage(cmd, subCmds, data.toString());
      resolve(res);
    });
  });
}

/**
 * Handle command help page text and recursively handle subcommand help page.
 * @param cmd 
 * @param subCmds 
 * @param text help page text
 * @returns fish completion script lines. One line <=> one completion.
 */
export async function handleHelpPage(cmd: string, subCmds: string[], text: string) {
  const curCmdChainStr = [cmd, ...subCmds].join(' ');
  logger.debug(`Handling help page for "${curCmdChainStr}"`);
  let data;
  try {
    logger.info(`Asking chatGPT for "${curCmdChainStr}"'s help page...`);
    data = await retry(makeFnParseHelpText(text));
  } catch (e) {
    logger.error(e);
    exit(1);
  }

  const script: string[] = [];
  // completion for options (-s or --long)
  for (const option of data.options) {
    const completion = cmdOptionCompletion(
      cmd,
      subCmds,
      option.short,
      option.long,
      option.description,
      option.argument
    );
    script.push(completion);
  }

  // if no arguments, disable the file completion for this command chain
  if (data.arguments.length === 0) {
    script.push(disableFileCompletion(cmd, subCmds));
  }

  logger.info(`Successfully parse help page for command chain "${curCmdChainStr}"`)
  // subcommands have different help page, handle them.
  const promises: Promise<string[]>[] = [];
  for (const subCmd of data.subcommands) {
    // exclude the executed subcommand now, which is usually incorrectly parsed by chatGPT.
    if (subCmds.lastIndexOf(subCmd.name) !== -1) {
      logger.debug(`subCmds has subCmd.name=${subCmd.name} in the answer, skip this subcommand`);
      continue;
    }
    if (subCmd.name === '') {
      logger.debug(`Empty subCmd name in the answer, skip this subcommand`);
      continue;
    }

    const completion = subCmdCompletion(
      cmd,
      subCmds,
      subCmd.name,
      subCmd.description
    );
    script.push(completion);

    // ask chatGPT again for subcommand
    // recompose the new args with the previous subcommand
    promises.push(execAndHandle(cmd, [...subCmds, subCmd.name]));
  }
  const subRes = await Promise.all(promises);
  script.push(...subRes.flat());

  return script;
}
