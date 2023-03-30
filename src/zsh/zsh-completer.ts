import { Completer } from '../completer';
import logger from '../logger';
import { UsageT } from '../schema';
import { defaultUsage } from '../utils/usage';
import {
  completeFunction,
  getCmdChainFnCode,
  mainCompletionFnCode,
  topComment,
} from './code';

export class ZshCompleter implements Completer {
  shell: 'zsh';
  command: string;
  constructor(command: string) {
    this.shell = 'zsh';
    this.command = command;
  }

  completeScript(usage: UsageT): string {
    const script: string[] = [];
    script.push(topComment(this.command));
    script.push(getCmdChainFnCode());
    script.push(mainCompletionFnCode(this.command, usage));
    script.push(...this.genCompleteFunctions([this.command], usage));
    return script.join('\n');
  }

  private genCompleteFunctions(cmdChain: string[], usage: UsageT): string[] {
    const fns: string[] = [];
    logger.debug(`completing function for cmdChain: ${cmdChain.join(' ')}...`);
    const firstFn = completeFunction(cmdChain, usage);
    fns.push(firstFn);

    if (usage.subcommands && usage.subcommands.length > 0) {
      for (const subcmd of usage.subcommands) {
        const subFns = this.genCompleteFunctions(
          [...cmdChain, subcmd.name],
          subcmd.usage ?? defaultUsage()
        );
        fns.push(...subFns);
      }
    }
    return fns;
  }
}
