import type { CommandHandler } from '#models';

export const ban: CommandHandler = {
  name: 'ban',
  description: 'Ban a user from the channel(s).',
  usage: '/ban <username> <channel> [reason]',
  examples: ['/ban bad_user #general', '/ban really_bad_user *'],
  requiresOperator: true,
  execute({ args, sendMessage, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/ban" requires a username and target channel');
      return;
    }

    const [username, targetChannel, ...reasonParts] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.ban(username, channels);

    if (reasonParts.length > 0) {
      sendMessage(username, reasonParts.join(' '), 'privmsg');
    }
  },
};

export const unban: CommandHandler = {
  name: 'unban',
  description: 'Unban user from channel(s).',
  usage: '/unban <username> <channel>',
  examples: ['/unban not_bad_user #general', '/unban redeemed_user *'],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/unban" requires a username and target channel.');
      return;
    }

    const [username, targetChannel] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.unban(username, channels);
  },
};

export const mute: CommandHandler = {
  name: 'mute',
  aliases: ['quiet'],
  description: 'Mute a user in channel(s).',
  usage: '/mute <username> <channel>',
  examples: ['/mute noisy-user #general', `/mute spammer *`],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/mute" requires a username and target channel.');
      return;
    }

    const [username, targetChannel] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.mute(username, channels);
  },
};

export const unmute: CommandHandler = {
  name: 'unmute',
  aliases: ['unquiet'],
  description: 'Unmute a user in channel(s).',
  usage: '/unmute <username> <channel>',
  examples: ['/unmute calm_user #general', `/unmute redeemed_user *`],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/mute" requires a username and target channel.');
      return;
    }

    const [username, targetChannel] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.unmute(username, channels);
  },
};

export const notice: CommandHandler = {
  name: 'notice',
  description: 'Send notice to specified channel or all channels if * is specified.',
  usage: '/notice <channel> <message>',
  examples: ['/notice #general Hello, everyone', '/notice * Hello, everyone'],
  requiresOperator: true,
  execute({ args, sendMessage, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('Please provide a channel and the notice message');
      return;
    }

    const text = args.slice(1).join(' ');
    const targetChannels: string[] = [];
    if (args[0] === '*') {
      stores.channel.channelNameList.forEach((channel) => {
        targetChannels.push(channel);
      });
    } else {
      targetChannels.push(args[0]);
    }

    targetChannels.forEach((channel) => {
      sendMessage(channel, text, 'notice');
    });
  },
};

export const banmask: CommandHandler = {
  name: 'banmask',
  description: 'Bans a host mask. Host masks are in the form of "nick!ident@host"',
  usage: '/banmask <mask> <channel>',
  examples: ['/banmask *!*@some.host.net #general', `/banmask *!*@ban.evader.net *`],
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/banmask" requires a mask and target channel');
    }

    const [mask, targetChannel] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.addBanMask(mask, channels);
  },
};

export const unbanmask: CommandHandler = {
  name: 'unbanmask',
  description: 'Removes a host mask mask. Host masks are in the form of "nick!ident@host"',
  usage: '/unbanmask <mask> <channel>',
  requiresOperator: true,
  execute({ args, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/unbanmask" requires a mask and target channel');
    }

    const [mask, targetChannel] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.removeBanMask(mask, channels);
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
  description:
    'Kick user from channel(s). Setting "*" as the channel kicks user from all channels.',
  usage: '/kick <username> <channel> [reason]',
  examples: ['/kick bad_user #general', '/kick really_bad_user *'],
  requiresOperator: true,
  execute({ args, sendMessage, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage('"/kick" requires a username and target channel');
      return;
    }

    const [username, targetChannel, ...reasonParts] = args;
    const channels = targetChannel === '*' ? stores.channel.channelNameList : [targetChannel];
    stores.operator.kick(username, channels);

    if (reasonParts.length > 0) {
      sendMessage(username, reasonParts.join(' '), 'privmsg');
    }
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
