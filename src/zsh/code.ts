import { OptT, SubCmdT, UsageT } from '../schema';
import { addBackslash } from '../utils/backslash';

/**
 * Return the code for the complete function
 *
 * Example:
 * ```zsh
 * function complete_cmd_subcmd() {
 *   _values "cmd subcmd" \
 *     "subcmd1[description]" \
 *     "subcmd2[description]"
 *   _arguments -s \
 *     "--long-opt[description]" \
 *     "-s[description]"
 *   _alternative \
 *     "files:filename:_files"
 * }
 * ```
 * @param cmdChain
 * @param usage
 * @returns
 */
export function completeFunction(cmdChain: string[], usage: UsageT) {
  const fnName = ['complete', ...cmdChain].join('_');
  const fnLines = [`function ${fnName}() {`];
  if (usage.subcommands && usage.subcommands.length > 0) {
    const subcmds = completeSubcmds(cmdChain, usage.subcommands);
    fnLines.push(subcmds);
  }
  if (usage.options && usage.options.length > 0) {
    const options = completeOptions(usage.options);
    fnLines.push(options);
  }
  if (usage.arguments && usage.arguments.length > 0) {
    const allowFileCompletion = allowFile();
    fnLines.push(allowFileCompletion);
  }

  fnLines.push('}');
  return fnLines.join('\n');
}

/**
 * Complete a value completion
 *
 * Example:
 * ```zsh
 *   _values "cmd subcmd" \
 *     "subcmd1[description]" \
 *     "subcmd2[description]"
 * ```
 * @param cmdChain
 * @param subcmds
 * @returns
 */
export function completeSubcmds(
  cmdChain: string[],
  subcmds: SubCmdT[]
): string {
  const valuesTag = `"${cmdChain.join(' ')}"`;
  const values = subcmds.map((subcmd) => {
    if (subcmd.description) {
      return `"${subcmd.name}[${addBackslash(subcmd.description, '"', '$')}]"`;
    }
    return `"${subcmd.name}"`;
  });
  return [`  _values ${valuesTag}`, ...values].join(' \\\n    ');
}

/**
 * Complete arguments completion
 *
 * Example:
 * ```zsh
 *   _arguments -s \
 *    "--long-opt[description]" \
 *    "-s[description]"
 * ```
 * @param options
 * @returns
 */
export function completeOptions(options: OptT[]): string {
  const optionLines: string[] = [];
  for (const option of options) {
    if (option.short) {
      if (option.description) {
        optionLines.push(`"${option.short}[${addBackslash(option.description, '"', '$')}]"`);
      } else {
        optionLines.push(`"${option.short}"`);
      }
    }
    if (option.long) {
      if (option.description) {
        optionLines.push(`"${option.long}[${addBackslash(option.description, '"', '$')}]"`);
      } else {
        optionLines.push(`"${option.long}"`);
      }
    }
  }
  return ['  _arguments -s', ...optionLines].join(' \\\n    ');
}

/**
 * Allow file arguments completion
 * 
 * Example:
 * ```zsh
 *   _alternative \
    "files:filename:_files"
 * ```
 * @returns
 */
export function allowFile(): string {
  // TODO: more detailed completion
  return ['  _alternative', '"files:filename:_files"'].join(' \\\n    ');
}

export function getCmdChainFnCode(): string {
  return `
function __get_cmd_chain() {
  local cmd_chain=()
  local chain_str=\${1}

  local args=(\${(s: :)chain_str})

  for arg in $args; do
    if [[ $arg[1] == "-" ]]; then
      echo $cmd_chain
      return
    fi
    cmd_chain+=($arg)
  done

  # "cmd sub1" should be parsed "cmd" because the command chain may not finish
  # eg. "cmd su" would not work if it's parsed to ("cmd" "su")
  if [[ $chain_str[-1] == " " ]]; then
    echo $cmd_chain
  else
    echo $cmd_chain[1,-2]
  fi
}
`;
}

export function mainCompletionFnCode(cmd: string, usage: UsageT): string {
  const cmdChains: string[][] = dfsCmdChain([cmd], usage);
  const branches: string[] = cmdChains.map((cmdChain) => {
    const branch = `  "${cmdChain.join(' ')}")
    complete_${cmdChain.join('_')}
    ;;`;
    return branch;
  });
  const fnCode = `
function _${cmd}() {
  local parsed=$(__get_cmd_chain $BUFFER)

  # "eat" the previous arguments and options so that _arguments can work normally
  # while there is non-option args before the cursor
  local count=\${#\${(z)parsed}}
  # $count - 1 times
  for ((i = 1; i < $count; i++)); do
    _arguments - C \\
      "1: :->cmds" \\
      "*::arg:->args"
  done

  case $parsed in
${branches.join('\n')}
  *) ;;
  esac
}`;
  return fnCode;
}

function dfsCmdChain(curChain: string[], usage?: UsageT): string[][] {
  const cmdChains: string[][] = [];
  cmdChains.push(curChain);
  if (usage && usage.subcommands && usage.subcommands.length > 0) {
    for (const subcmd of usage.subcommands) {
      const subcmdChains = dfsCmdChain(
        [...curChain, subcmd.name],
        subcmd.usage
      );
      for (const subcmdChain of subcmdChains) {
        cmdChains.push(subcmdChain);
      }
    }
  }
  return cmdChains;
}

/**
 * Special comment for zsh completion
 *
 * Example:
 * ```zsh
 * #compdef _cmd cmd
 * ```
 * @param cmd
 * @returns
 */
export function topComment(cmd: string) {
  return `#compdef _${cmd} ${cmd}`;
}
