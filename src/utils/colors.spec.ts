import { describe, expect, it } from 'vitest';
import { isAccessibleHexColor, NAMED_COLORS } from './colors';

describe('colors', () => {
  it('ensures all named colors are accessible', () => {
    for (const [name, hexValue] of Object.entries(NAMED_COLORS)) {
      // oxlint-disable-next-line jest/valid-expect Vitest allows a second argument for error messages
      expect(isAccessibleHexColor(hexValue), `${name} is not accessible`).toBe(true);
    }
  });
});
