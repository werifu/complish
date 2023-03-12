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
    return `complete -p ${cmd}`;
  }
  return `complete -c ${cmd}`;
}

/**
 * Add completion for the intended subcommand
 */
export function subCmdCompletion(
  cmd: string,
  curSubCmds: string[],
  intendedSubCmd: string,
  description?: string
) {
  const script = [completeHead(cmd)];
  const cond = `-n "__is_cmd_chain ${[cmd, ...curSubCmds].join(' ')}"`;
  script.push(cond);

  const add = `-a "${intendedSubCmd}"`
  script.push(add);

  if (description) {
    script.push(`-d "${description.replaceAll('"', '\\"')}"`);
  }
  return script.join(' ');
}

/**
 * Add completion for the indented option
 */
export function cmdOptionCompletion(
  cmd: string,
  subCmds: string[],
  short?: string,
  long?: string,
  description?: string,
  argument?: string
) {
  const script = [completeHead(cmd)];
  const cond = `-n "__is_cmd_chain ${[cmd, ...subCmds].join(' ')}"`;

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
    script.push(`-d "${description.replaceAll('"', '\\"')}"`);
  }
  return script.join(' ');
}

export function disableFileCompletion(cmd: string, subCmds: string[]) {
  const cond = `-n "__is_cmd_chain ${[cmd, ...subCmds].join(' ')}"`;
  return `${completeHead(cmd)} ${cond} --no-files`;
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
 * `__is_cmd_chain cmd sub1 sub2` returns 0
 */
export const isCmdChainFunc = `
function __is_cmd_chain
    # is like commandline.trim().split(' ' or '\\n').filter(!element.startsWith('-'))
    set -l full_cmd_arr (echo (commandline -poc) | string trim | tr ' ' '\\n' | grep -v '^-')
    set -l n (count $argv)
    if test $n != (count $full_cmd_arr)
        return 1
    end
    for i in (seq 1 $n)
        if test $full_cmd_arr[$i] != $argv[$i]
            return 1
        end
    end
    return 0
end
`;
