export function createNick(username: string) {
  const connectionId = Math.floor(Math.random() * 1_000);
  return `${username}^${connectionId}`;
}

export function parseNick(nick: string) {
  if (nick.includes('^')) {
    return nick.split('^')[0];
  } else {
    return nick;
  }
}
