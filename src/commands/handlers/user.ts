import type { CommandHandler } from '#models';

export const me: CommandHandler = {
  name: 'me',
  description: 'Posts message formatted as an action.',
  usage: '/me <message>',
  examples: ['/me laughs'],
  execute({ currentChannel, fullText, sendMessage }) {
    if (fullText.length > 0) {
      sendMessage(currentChannel, fullText, 'action');
    }
  },
};

export const ignore: CommandHandler = {
  name: 'ignore',
  description: 'Hide messages from a user',
  usage: '/ignore <username>',
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('Missing <username> input.');
      return;
    }

    const [username] = args;
    stores.userList.ignoreUser(username);
    stores.channel.addSystemMessage(`Ignoring "${username}"`);
  },
};

export const ignoreList: CommandHandler = {
  name: 'ignore-list',
  aliases: ['ignorelist'],
  description: 'Show currently ignored users.',
  usage: '/ignore-list',
  execute({ stores }) {
    const ignored = Array.from(stores.userList.ignoredUsernames).sort().join(', ');

    if (ignored.length === 0) {
      stores.channel.addSystemMessage('No users are ignored');
    } else {
      stores.channel.addSystemMessage(`Users ignored: ${ignored}`);
    }
  },
};

export const unignore: CommandHandler = {
  name: 'unignore',
  description: 'Show messages from a user',
  usage: '/unignore <username>',
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('Missing <username> input.');
      return;
    }

    const [username] = args;
    stores.userList.unignoreUser(username);
    stores.channel.addSystemMessage(`Unignoring "${username}"`);
  },
};

export const away: CommandHandler = {
  name: 'away',
  description: 'Set self as away. A default away message is sent if no reason is provide.',
  usage: '/away [reason]',
  examples: ['/away', '/away Lunch'],
  execute({ fullText, stores }) {
    stores.profile.setAway(fullText);
  },
};

export const unaway: CommandHandler = {
  name: 'unaway',
  aliases: ['back'],
  description: 'Set your status as online.',
  usage: '/unaway',
  execute({ stores }) {
    stores.profile.setUnaway();
  },
};
