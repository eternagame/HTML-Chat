import { describe, expect, it } from 'vitest';
import { toggleMDFormat } from './md-format.util';

describe('md-format', () => {
  describe('toggleMDFormat', () => {
    it('adds formatting', () => {
      const text = 'a cat category ';

      // Add around current selection
      expect(toggleMDFormat({ text, selectionRange: [2, 5], format: 'Highlight' })).toEqual({
        text: 'a |cat| category ',
        selectionRange: [3, 6],
      });
      // Add around current word based on position
      // Maintain cursor position
      expect(toggleMDFormat({ text, selectionRange: [3, 3], format: 'Highlight' })).toEqual({
        text: 'a |cat| category ',
        selectionRange: [4, 4],
      });
      // Add around current position if not in a word
      expect(toggleMDFormat({ text, selectionRange: [15, 15], format: 'Highlight' })).toEqual({
        text: 'a cat category ||',
        selectionRange: [16, 16],
      });
    });

    it('removes formatting', () => {
      const outputText = 'a cat category ';

      // Remove format surrounding current selection
      expect(
        toggleMDFormat({ text: 'a _cat_ category ', selectionRange: [3, 6], format: 'Underline' }),
      ).toEqual({
        text: outputText,
        selectionRange: [2, 5],
      });
      // Remove format around current word based on position
      expect(
        toggleMDFormat({ text: 'a _cat_ category ', selectionRange: [3, 3], format: 'Underline' }),
      ).toEqual({
        text: outputText,
        selectionRange: [2, 2],
      });
      // Remove format even if it was immediately added before
      expect(
        toggleMDFormat({
          text: 'a cat category __',
          selectionRange: [16, 16],
          format: 'Underline',
        }),
      ).toEqual({
        text: outputText,
        selectionRange: [15, 15],
      });
    });
  });
});
