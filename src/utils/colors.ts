export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRGB(hex: string) {
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
export function isAccessibleColor(r: number, g: number, b: number) {
  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return false;
  }

  const colorValue = brightness(r, g, b);
  return Math.abs((colorValue + 0.05) / (BACKGROUND_VALUE + 0.05)) > 4;
}

/** See {@link isAccessibleColor} */
export function isAccessibleHexColor(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    return false;
  }
  const { r, g, b } = hexToRGB(hex);
  return isAccessibleColor(r, g, b);
}

export const NAMED_COLORS: Record<string, string> = {
  orange: '#ffb400',
  yellow: '#ffff00',
  blue: '#00f8ff',
  green: '#53ff00',
  purple: '#ff76ff',
};

export function getNamedColor(colorName: string): string | null {
  return NAMED_COLORS[colorName] ?? null;
}
