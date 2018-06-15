export const noop = () => undefined;

export function center(str: string, length: number, char = ' '): string {
  return char.repeat((length - str.length) / 2) + str;
}

export async function sleep(ms: number): Promise<void> {
  return await new Promise<void>(resolve => {
    window.setTimeout(() => {
      resolve();
    }, ms);
  });
}
