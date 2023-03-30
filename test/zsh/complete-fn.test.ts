import { UsageT } from '../../src/schema';
import {
  completeFunction,
  completeOptions,
  completeSubcmds,
  mainCompletionFnCode,
} from '../../src/zsh/code';

describe('completion function', () => {
  test('subcmd completion', () => {
    const subcmds = [
      {
        name: 'subcmd1',
        description: 'some description1',
      },
      {
        name: 'subcmd2',
        description: 'some description2',
      },
    ];
    const completion = completeSubcmds(['cmd', 'sub1', 'sub2'], subcmds);
    expect(completion).toBe(
      `  _values "cmd sub1 sub2" \\
    "subcmd1[some description1]" \\
    "subcmd2[some description2]"`
    );
  });

  test('option completion', () => {
    const options = [
      {
        short: '-f',
        long: '--file',
        description: 'some desc',
        argument: '<file>',
      },
      {
        short: '-s',
        long: '--string',
        description: 'some desc s',
        argument: '<string>',
      },
    ];
    const completion = completeOptions(options);
    expect(completion).toBe(
      `  _arguments -s \\
    "-f[some desc]" \\
    "--file[some desc]" \\
    "-s[some desc s]" \\
    "--string[some desc s]"`
    );
  });

  test('function generation', () => {
    const usage: UsageT = {
      subcommands: [
        {
          name: 'subcmd1',
          description: 'some description1',
        },
        {
          name: 'subcmd2',
          description: 'some description2',
        },
      ],
      arguments: [
        {
          name: 'arg1',
          description: 'some arg description1',
        },
      ],
      options: [
        {
          short: '-f',
          long: '--file',
          description: 'some desc',
          argument: '<file>',
        },
        {
          short: '-s',
          long: '--string',
          description: 'some desc s',
          argument: '<string>',
        },
      ],
    };

    const code = completeFunction(['cmd', 'sub1'], usage);
    const expected = `function complete_cmd_sub1() {
  _values "cmd sub1" \\
    "subcmd1[some description1]" \\
    "subcmd2[some description2]"
  _arguments -s \\
    "-f[some desc]" \\
    "--file[some desc]" \\
    "-s[some desc s]" \\
    "--string[some desc s]"
  _alternative \\
    "files:filename:_files"
}`;
    expect(code).toBe(expected);
  });

  test('main completion test', () => {
    const usage: UsageT = {
      subcommands: [
        {
          name: 'sub1',
          description: 'some description1',
          usage: {
            subcommands: [
              {
                name: 'subsub1',
                description: 'some description1',
              },
              {
                name: 'subsub2',
                description: 'some description2',
              },
            ],
            arguments: [],
            options: [],
          },
        },
        {
          name: 'sub2',
          description: 'some description2',
          usage: {
            subcommands: [],
            arguments: [],
            options: [],
          },
        },
      ],
      arguments: [],
      options: [],
    };

    const codes = mainCompletionFnCode('mycmd', usage);
    const expected = `
function _mycmd() {
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
  "mycmd")
    complete_mycmd
    ;;
  "mycmd sub1")
    complete_mycmd_sub1
    ;;
  "mycmd sub1 subsub1")
    complete_mycmd_sub1_subsub1
    ;;
  "mycmd sub1 subsub2")
    complete_mycmd_sub1_subsub2
    ;;
  "mycmd sub2")
    complete_mycmd_sub2
    ;;
  *) ;;
  esac
}`;
    expect(codes).toBe(expected);
  });
});
