const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
export function isEmoji(emoji: string) {
  return EMOJI_REGEX.test(emoji);
}
