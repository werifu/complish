import { addBackslash } from '../src/utils/backslash';

describe('backslash transform', () => {
  test('backslash', () => {
    expect(addBackslash('$some', '$')).toBe('\\$some');
    expect(addBackslash('"$some"', '$', '"')).toBe('\\"\\$some\\"');
    expect(addBackslash(`"'$some'"`, '$', "'", '"')).toBe(`\\"\\'\\$some\\'\\"`);
  });
})