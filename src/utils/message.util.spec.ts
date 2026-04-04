import { describe, expect, it } from 'vitest';
import { containsWords, highlightWords } from './message.util';

describe('message', () => {
  it('highlights words', () => {
    const keywords = new Set(['cat']);

    expect(highlightWords('unchanged sentence', new Set())).toBe('unchanged sentence');
    expect(highlightWords('cat', keywords)).toBe('|cat|');
    expect(highlightWords('Cat', keywords)).toBe('|Cat|');
    expect(highlightWords('category', keywords)).toBe('category');
    expect(highlightWords('cat category', keywords)).toBe('|cat| category');
    expect(highlightWords("The cat's paw on the cat.", keywords)).toBe(
      "The |cat|'s paw on the |cat|.",
    );
    expect(highlightWords('Already highlighted |cat|.', keywords)).toBe(
      'Already highlighted |cat|.',
    );
  });

  it('detects specified words', () => {
    const keywords = new Set(['milk', 'eggs', 'cheese']);

    expect(containsWords('apples, bread, something else', keywords)).toBe(false);
    expect(containsWords('Eggs!', keywords)).toBe(true);
  });
});
