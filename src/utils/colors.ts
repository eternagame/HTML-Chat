export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRGB(hex: `#${number}${number}${number}`) {
  const r = Number.parseInt(hex.substring(1, 3), 16);
  const g = Number.parseInt(hex.substring(3, 5), 16);
  const b = Number.parseInt(hex.substring(5, 7), 16);
  return { r, g, b };
}

/** Gets brightness of a color. used in contract calculation. */
export function brightness(r: number, g: number, b: number) {
  return (299 * r + 587 * g + 114 * b) / 1000;
}

const BACKGROUND_VALUE = brightness(4, 52, 104);
/** Determines whether color contrasts well with background */
export function isValidColor(r: number, g: number, b: number) {
  const colorValue = brightness(r, g, b);
  return Math.abs((colorValue + 0.05) / (BACKGROUND_VALUE + 0.05)) > 4;
}
