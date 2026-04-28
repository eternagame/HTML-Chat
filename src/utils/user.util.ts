export function createNick(username: string) {
  const connectionId = Math.floor(Math.random() * 1_000);
  return `${username}^${connectionId}`;
}

/**
 * Get username from nick
 */
export function parseNick(nick: string) {
  if (nick.includes('^')) {
    // Current format: 'username^connectionId'
    return nick.split('^')[0];
  } else {
    return nick;
  }
}

const UID_REGEX = /^~?(\d+)$/i;

export function parseUid(uid: string): string {
  const uidMatch = UID_REGEX.exec(uid);
  if (uidMatch) {
    return uidMatch[1];
  }

  return '0';
}

/**
 * @param mask Typically form of `username^*!*@*` (ban) or `m:username^*!*@*` (muted)
 */
export function isMaskMatch(nick: string, mask: string): boolean {
  const nickMask = mask.replace(/!.+/, '');
  // Match against ban or mute mask
  const adjustedMask = `^${nickMask.replace(/^m:/, '(m:)?').replaceAll('*', '.+').replaceAll('^', '\\^')}$`;
  const maskRegex = new RegExp(adjustedMask, 'i');
  return maskRegex.test(nick);
}
