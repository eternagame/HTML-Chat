import { AVAILABLE_CHANNELS } from '#constants';
import type { CommandHandler } from '#models';

export const ban: CommandHandler = {
  name: 'ban',
  description: 'Ban a user from the channel(s).',
  usage: '/ban <username>',
  examples: ['/ban bad_user'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/ban" requires a username');
      return;
    }

    const [username] = args;
    stores.operator.ban(username, AVAILABLE_CHANNELS);
  },
};

export const unban: CommandHandler = {
  name: 'unban',
  description: 'Unban user from channel(s).',
  usage: '/unban <username>',
  examples: ['/unban not_bad_user'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/unban" requires a username');
      return;
    }

    const [username] = args;
    stores.operator.unban(username, AVAILABLE_CHANNELS);
  },
};

export const mute: CommandHandler = {
  name: 'mute',
  aliases: ['quiet'],
  description: 'Mute a user in channel(s).',
  usage: '/mute <username>)',
  examples: ['/mute noisy-user'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/mute" requires a username.');
      return;
    }

    const [username] = args;
    stores.operator.mute(username, AVAILABLE_CHANNELS);
  },
};

export const unmute: CommandHandler = {
  name: 'unmute',
  aliases: ['unquiet'],
  description: 'Unmute a user in channel(s).',
  usage: '/unmute <username>',
  examples: ['/unmute calm_user'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/unmute" requires a username.');
      return;
    }

    const [username] = args;
    stores.operator.unmute(username, AVAILABLE_CHANNELS);
  },
};

export const notice: CommandHandler = {
  name: 'notice',
  description: 'Send notice to specified channel or all channels if * is specified.',
  usage: '/notice <channel> <message>',
  examples: ['/notice #general Hello, everyone', '/notice * Hello, everyone'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('Please provide a channel and the notice message');
      return;
    }

    const [targetChannel, ...messageParts] = args;
    const text = messageParts.join(' ');
    stores.operator.notice(targetChannel === '*' ? AVAILABLE_CHANNELS : [targetChannel], text);
  },
};

export const banmask: CommandHandler = {
  name: 'banmask',
  description: 'Bans a host mask. Host masks are in the form of "nick!ident@host"',
  usage: '/banmask <mask>',
  examples: ['/banmask *!*@some.host.net'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/banmask" requires a mask');
    }

    const [mask] = args;
    stores.operator.addBanMask(mask, AVAILABLE_CHANNELS);
  },
};

export const unbanmask: CommandHandler = {
  name: 'unbanmask',
  description: 'Removes a host ban mask. Host masks are in the form of "nick!ident@host"',
  usage: '/unbanmask <mask>',
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/unbanmask" requires a mask');
    }

    const [mask] = args;
    stores.operator.removeBanMask(mask, AVAILABLE_CHANNELS);
  },
};

export const mutemask: CommandHandler = {
  name: 'mutemask',
  description: 'Mutes a host mask. Host masks are in the form of "nick!ident@host"',
  usage: '/mutemask <mask>',
  examples: ['/mutemask *!*@some.host.net'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/mutemask" requires a mask');
    }

    const [mask] = args;
    stores.operator.addMuteMask(mask, AVAILABLE_CHANNELS);
  },
};

export const unmuteMask: CommandHandler = {
  name: 'unmutemask',
  description: 'Removes a host mute mask. Host masks are in the form of "nick!ident@host"',
  usage: '/unmutemask <mask>',
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/unmutemask" requires a mask');
    }

    const [mask] = args;
    stores.operator.removeMuteMask(mask, AVAILABLE_CHANNELS);
  },
};

export const user: CommandHandler = {
  name: 'user',
  description: 'Get username by nick.',
  usage: '/user <nick>',
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('"/user" requires a <nick> argument.');
      return;
    }
    const nick = args[0];
    const user = stores.userList.getUserByNick(nick);
    if (!user) {
      stores.channel.addSystemMessage(`"${nick}" not found.`);
    } else {
      stores.channel.addSystemMessage(`"${nick}" username: ${user.username}`);
    }
  },
};

export const nicks: CommandHandler = {
  name: 'nicks',
  description: 'Get nicks by username.',
  usage: '/nicks <username>',
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('"/nicks" requires a <username> argument.');
      return;
    }

    const username = args[0];
    const user = stores.userList.getUserByUsername(username);
    if (!user) {
      stores.channel.addSystemMessage(`"${username}" not found.`);
    } else if (user.status === 'offline') {
      stores.channel.addSystemMessage(`"${username}" is currently offline.`);
    } else {
      stores.channel.addSystemMessage(`"${username}" nicks: ${Array.from(user.nicks).join(', ')}`);
    }
  },
};

export const kick: CommandHandler = {
  name: 'kick',
  description: 'Kick user from channel',
  usage: '/kick <username> [reason]',
  examples: ['/kick bad_user', '/kick really_bad_user'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 1) {
      stores.channel.addSystemMessage('"/kick" requires a username');
      return;
    }

    const [username, ...reasonParts] = args;
    stores.operator.kick(username, AVAILABLE_CHANNELS, reasonParts.join(' '));
  },
};

export const banlist: CommandHandler = {
  name: 'banlist',
  description: 'Get list of bans',
  usage: '/banlist',
  requiresOperator: true,
  execute({ stores }) {
    stores.operator.getBanList();
  },
};

export const execute: CommandHandler = {
  name: 'execute',
  aliases: ['exec'],
  description:
    'Allow operator to send an IRC command directly through the websocket. For using commands not yet available in the client.',
  usage: '/execute <IRC commands>',
  requiresOperator: true,
  execute({ fullText, stores }) {
    if (fullText.length > 0) {
      stores.irc.client?.raw(fullText);
    }
  },
};
