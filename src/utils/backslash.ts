export function addBackslash(origin: string, ...args: string[]): string {
  let after = origin;
  for (const arg of args) {
    after = after.replaceAll(arg, `\\${arg}`);
  }
  return after;
}