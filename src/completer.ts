import { UsageT } from "./schema";

export interface Completer {
  shell: 'fish' | 'zsh',
  command: string,
  completeScript(usage: UsageT): string,
}
