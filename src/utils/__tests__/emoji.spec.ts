import { isEmoji } from '#utils/emoji.ts';
import { describe, expect, it } from 'vitest';

describe('emoji', () => {
  it('detects emojis', () => {
    expect(isEmoji('!')).toBe(false);
    expect(isEmoji('.')).toBe(false);
    expect(isEmoji('a')).toBe(false);
    expect(isEmoji('1')).toBe(false);
    expect(isEmoji('*')).toBe(false);
    expect(isEmoji('👋')).toBe(true);
    expect(isEmoji('👪')).toBe(true);
  });
});
