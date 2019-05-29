function parseUsername(nick: string): string{
    return nick.substr(0, nick.indexOf('^') === -1 ? nick.length : nick.indexOf('^'));
}

export {parseUsername}