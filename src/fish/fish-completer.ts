import { Completer } from '../completer';
import { UsageT } from '../schema';
import { disableFileCompletion, fishFuncs, optionCompletion, subCmdCompletion } from './code';

export class FishCompleter implements Completer {
  shell: 'fish';
  command: string;
  constructor(command: string) {
    this.shell = 'fish';
    this.command = command;
  }

  postHelp(): string {
    return `Remember to copy the file to your fish completions directory. Run \`echo $fish_complete_path\` to check.`;
  }

  completeScript(usage: UsageT): string {
    const usageCode = this.complete([this.command], usage);
    return [fishFuncs, usageCode].join('\n');
  }

  private complete(cmdChain: string[], usage: UsageT): string {
    const script: string[] = [];
    if (!usage.arguments || usage.arguments.length === 0) {
      script.push(disableFileCompletion(cmdChain));
    }

    for (const option of usage.options) {
      const line = optionCompletion(cmdChain, option.short, option.long, option.description, option.argument);
      script.push(line);
    }

    for (const subcmd of usage.subcommands) {
      const line = subCmdCompletion(cmdChain, subcmd.name, subcmd.description);
      script.push(line);
      if (subcmd.usage) {
        const subUsageCode = this.complete([...cmdChain, subcmd.name], subcmd.usage);
        script.push(subUsageCode);
      }
    }
    return script.join('\n');
  }
}
