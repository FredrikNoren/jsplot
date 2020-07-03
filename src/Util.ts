
// From: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
export function hashCode(s: string): number {
  let h = 0;
  for(let i = 0; i < s.length; i++) {
    // tslint:disable-next-line:no-bitwise
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }

  return h;
}

export function stringToHSL(string: string, saturation: number, light: number) {
  return `hsl(${hashCode(string) % 360}, ${100*saturation}%, ${100*light}%)`;
}

export function arrayReplaceIndex<T>(array: T[], index: number, value: T): T[] {
  const a2 = [...array];
  a2[index] = value;
  return a2;
}
export function arrayInsertIndex<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index)];
}
export function arrayRemoveIndex<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}
export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const arr = array.slice();
  const [el] = arr.splice(fromIndex, 1);
  arr.splice(Math.max(toIndex, 0), 0, el);
  return arr;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
export function mix(a: number, b: number, p: number) {
  return a * (1 - p) + b * p;
}
export function interpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  const p = (x - x0) / (x1 - x0);
  return y0 + p * (y1 - y0);
}
export function interpolateClamped(x: number, x0: number, x1: number, y0: number, y1: number): number {
  const p = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + p * (y1 - y0);
}