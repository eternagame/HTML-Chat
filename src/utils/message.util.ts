export function highlightWords(text: string, words: ReadonlySet<string>): string {
  if (words.size === 0) {
    return text;
  }

  // Escape RegEx characters and make into OR pattern
  const pattern = Array.from(words)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  // Avoid double-highlighting words
  const regex = new RegExp(`(?<!\\|)(\\b)(${pattern})(\\b)(?!\\|)`, 'gi');

  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
  return text.replace(regex, '$1|$2|$3');
}

export function containsWords(text: string, words: ReadonlySet<string>): boolean {
  if (words.size === 0) {
    return false;
  }

  // Escape RegEx characters and make into OR pattern
  const pattern = Array.from(words)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
  return regex.test(text);
}
