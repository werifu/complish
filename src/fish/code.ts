import path from 'path';
import { addBackslash } from '../utils/backslash';

/**
 * -c or --command COMMAND
 * Specifies that COMMAND is the name of the command.
 *
 * -p or --path COMMAND
 * Specifies that COMMAND is the absolute path of the command(optionally containing wildcards).
 *
 * See https://fishshell.com/docs/current/cmds/complete.html
 * @param cmd command or a binary file' absolute path
 * @returns 'complete -c cmd' or 'complete -p /path/cmd'
 */
export function completeHead(cmd: string) {
  if (cmd.includes('/')) {
    const absPath = path.resolve(cmd);
    return `complete -p ${absPath}`;
  }
  return `complete -c ${cmd}`;
}

/**
 * Add completion for the intended subcommand
 */
export function subCmdCompletion(
  cmdChain: string[],
  intendedSubCmd: string,
  description?: string
) {
  const script = [completeHead(cmdChain[0])];
  const cond = getCondition(cmdChain);
  script.push(cond);

  const add = `-a "${intendedSubCmd}"`;
  script.push(add);

  if (description) {
    script.push(`-d "${addBackslash(description, '"', '$')}"`);
  }
  return script.join(' ');
}

/**
 * Add completion for the indented option
 */
export function optionCompletion(
  cmdChain: string[],
  short?: string,
  long?: string,
  description?: string,
  argument?: string
): string {
  const script = [completeHead(cmdChain[0])];
  const cond = getCondition(cmdChain);

  script.push(cond);
  if (short && short.startsWith('-')) {
    script.push(`-s ${short.slice(1)}`);
  }
  if (long && long.startsWith('--')) {
    script.push(`-l ${long.slice(2)}`);
  }
  // TODO. distinguish the type of argument, like <file> or <number>...
  if (argument) {
    script.push('--require-parameter');
  }
  if (description) {
    script.push(`-d "${addBackslash(description, '"', '$')}"`);
  }
  return script.join(' ');
}

export function disableFileCompletion(cmdChain: string[]): string {
  const cond = getCondition(cmdChain);
  return `${completeHead(cmdChain[0])} ${cond} --no-files`;
}

/**
 * Get condition code for fish complete command
 */
export function getCondition(cmdChain: string[]): string {
  const fmtChainStr = cmdChain
    .map((cmd) =>
      addBackslash(cmd, '"', "'", '$')
    )
    .join(' ');
  return `-n "__same_cmd_chain (echo (commandline -poc)) '${fmtChainStr}'"`;
}

/**
 * Returns 0 (true in Unix) if the current commandline matches the command chain from arguments of this function.
 * (options starts with '-' is ignored)
 *
 * Otherwise returns 1
 *
 * Example:
 *
 * When `$ cmd sub1 sub2 -h`
 *
 * `__same_cmd_chain "cmd sub1 sub2" "cmd sub1 sub2 -f file"` returns 0
 */
export const fishFuncs = `# match all args before '-' options
function __get_cmd_chain
    set -l truncated_array
    set -l array (string split " " $argv)

    for arg in $array
        if string match -qr "^-" -- $arg
            break
        end
        # remove empty arg so that any number of spaces between args is ok
        if test -z "$arg"
            continue
        end
        set truncated_array $truncated_array $arg
    end

    echo $truncated_array
end

function __same_cmd_chain
    set -l input $argv[1]
    set -l baseline $argv[2]

    set -l parsed_input (__get_cmd_chain $input)
    if test (echo $parsed_input) = (echo $baseline)
        return 0
    else
        return 1
    end
end
`;
