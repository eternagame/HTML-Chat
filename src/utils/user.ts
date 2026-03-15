export function createNick(username: string) {
  const connectionId = Math.floor(Math.random() * 1_000);
  return `${username}^${connectionId}`;
}

const LEGACY_USERNAME_REGEX = /^(.+)__\d+\^\d+$/i;
const LEGACY_UID_REGEX = /^.+__(\d+)\^\d+$/i;

export function parseNick(nick: string) {
  const match = LEGACY_USERNAME_REGEX.exec(nick);
  if (match) {
    return match[1];
  }

  if (nick.includes('^')) {
    // Current format: 'username^connectionId'
    return nick.split('^')[0];
  } else {
    return nick;
  }
}

export function parseUid(nick: string, uid: string): string {
  if (uid === 'anon') {
    const match = LEGACY_UID_REGEX.exec(nick);
    if (match) {
      return match[1];
    }
  }

  return uid;
}
