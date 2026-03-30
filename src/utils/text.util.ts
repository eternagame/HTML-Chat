export function isCaseInsensitiveMatch(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
}

/**
 * Find the original string from list.
 * Useful for preventing duplicate entries with different character casings.
 */
export function findOriginalString(sourceList: string[], text: string) {
  return sourceList.find((s) => isCaseInsensitiveMatch(s, text)) ?? null;
}
