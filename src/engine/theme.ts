const HEX_SHORT = /^#[0-9a-fA-F]{3}$/;
const HEX_LONG = /^#[0-9a-fA-F]{6}$/;

const NAMED_COLORS = new Set([
  "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
  "brightblack", "brightred", "brightgreen", "brightyellow",
  "brightblue", "brightmagenta", "brightcyan", "brightwhite",
]);

export function isValidColor(s: string): boolean {
  if (!s) return false;
  if (HEX_SHORT.test(s) || HEX_LONG.test(s)) return true;
  if (NAMED_COLORS.has(s.toLowerCase())) return true;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 255;
}