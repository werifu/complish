import { completeHead, optionCompletion, subCmdCompletion } from '../../src/fish/code';

describe('test generating compeltion', () => {
  test('head', () => {
    const cmdHead = completeHead('cmd');
    expect(cmdHead).toBe('complete -c cmd');

    const pathHead = completeHead('/usr/path/cmd');
    expect(pathHead).toBe('complete -p /usr/path/cmd');
  });

  test('sub cmd completion', () => {
    const completion = subCmdCompletion(
      ['cmd', 'sub1', 'sub2'],
      'future_sub',
      'some description'
    );
    expect(completion).toBe(
      `${completeHead(
        'cmd'
      )} -n "__same_cmd_chain (echo (commandline -poc)) 'cmd sub1 sub2'" -a "future_sub" -d "some description"`
    );
  });

  test('cmd option completion', () => {
    const completion = optionCompletion(
      ['cmd', 'sub1', 'sub2'],
      '-f',
      '--file',
      'some desc',
      '<file>'
    );
    expect(completion).toBe(
      `${completeHead(
        'cmd'
      )} -n "__same_cmd_chain (echo (commandline -poc)) 'cmd sub1 sub2'" -s f -l file --require-parameter -d "some desc"`
    );
  });
});
