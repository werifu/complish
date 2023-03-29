import { spawn } from "child_process";
import { exit } from "process";
import logger from "./logger";
import { makeFnParseHelpText } from "./openai";
import { UsageT } from "./schema";
import { retry } from "./utils/retry";

/**
 * wrap spawn to a Promise, getting text from `cmd --help`
 * @param cmdChain
 * @returns text of help page
 */
export async function getHelpText(cmdChain: string[]) {
  return new Promise((resolve: (text: string) => void, reject) => {
    const cmd = cmdChain[0];
    const subCmds = cmdChain.slice(1);
    const args = subCmds ? [...subCmds, '--help'] : ['--help'];
    const child = spawn(cmd, args);
    const chunks: any[] = [];
    child.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });
    child.on('close', async (_) => {
      const data = Buffer.concat(chunks);
      resolve(data.toString());
    });
    child.stderr.on('data', (_) => {
      // may no have --help
      reject();
    });
  });
}


export async function buildHelpTreeRec(cmdChain: string[]): Promise<UsageT> {
  const helpText = await getHelpText(cmdChain).catch(() => null);
  if (!helpText) {
    return {
      options: [],
      arguments: [],
      subcommands: [],
    };
  }

  const curCmdChainStr = cmdChain.join(' ');
  let data: UsageT;
  try {
    logger.info(`Asking chatGPT for "${curCmdChainStr}"'s help page...`);
    data = await retry(makeFnParseHelpText(helpText));
  } catch (e) {
    logger.error(e);
    exit(1);
  }

  const promises = data.subcommands.map(async subCmd => {
    // exclude the executed subcommand now, which is usually incorrectly parsed by chatGPT.
    if (cmdChain.lastIndexOf(subCmd.name) !== -1) {
      logger.debug(`subCmds has subCmd.name=${subCmd.name} in the answer, skip this subcommand`);
      return undefined;
    }
    if (subCmd.name === '') {
      logger.debug(`Empty subCmd name in the answer, skip this subcommand`);
      return undefined;
    }
    return await buildHelpTreeRec([...cmdChain, subCmd.name]);
  });

  const res = await Promise.all(promises);
  for (const [idx, subCmd] of data.subcommands.entries()) {
    subCmd.usage = res[idx];
  }

  return data;
}