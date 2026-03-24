import type { CommandHandler, TODO } from '#models';

/**
 * Ban user from channel(s).
 * `/ban <channel> <username> [reason]`
 * `/ban * <username> [reason]`
 */
export const ban: TODO = null;
/**
 * Unban user from channel(s).
 * `/unban <channel> <username>`
 * `/unban * <username>`
 */
export const unban: TODO = null;
/**
 * Quiet user from channel(s).
 * `/quiet <channel> <username>`
 * `/quiet * <username>`
 */
export const quiet: TODO = null;
/**
 * Unquiet user from channel(s).
 * `/unquiet <channel> <username>`
 * `/unquiet * <username>`
 */
export const unquiet: TODO = null;

export const notice: CommandHandler = {
  name: 'notice',
  description: 'Send notice to specified channel or all channels if * is specified.',
  usage: '/notice <channel> <message>',
  examples: ['/notice #general Hello, everyone', '/notice * Hello, everyone'],
  requiresOperator: true,
  execute({ currentChannel, args, sendMessage, stores }) {
    if (args.length < 2) {
      stores.channel.addSystemMessage(
        currentChannel,
        'Please provide a channel and the notice message',
      );
      return;
    }

    const text = args.slice(1).join(' ');
    const targetChannels: string[] = [];
    if (args[0] === '*') {
      stores.channel.channelList.forEach((channel) => {
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
/**
 * Ban hostmask (form: `user!nick@host`).
 * `/banmask <channel> <mask>`
 */
export const banmask: TODO = null;
/**
 * Unban hostmask.
 * `/unbanmask <channel> <mask>`
 */
export const unbanmask: TODO = null;

export const user: CommandHandler = {
  name: 'user',
  description: 'Get username by nick.',
  requiresOperator: true,
  usage: '/user <nick>',
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(currentChannel, '"/user" requires a <nick> argument.');
      return;
    }
    const nick = args[0];
    const user = stores.userList.getUserByNick(nick);
    if (!user) {
      stores.channel.addSystemMessage(currentChannel, `"${nick}" not found.`);
    } else {
      stores.channel.addSystemMessage(currentChannel, `"${nick}" username: ${user.username}`);
    }
  },
};

export const nicks: CommandHandler = {
  name: 'nicks',
  description: 'Get nicks by username.',
  usage: '/nicks <username>',
  requiresOperator: true,
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(currentChannel, '"/nicks" requires a <username> argument.');
      return;
    }

    const username = args[0];
    const user = stores.userList.getUserByUsername(username);
    if (!user) {
      stores.channel.addSystemMessage(currentChannel, `"${username}" not found.`);
    } else if (user.status === 'offline') {
      stores.channel.addSystemMessage(currentChannel, `"${username}" is currently offline.`);
    } else {
      stores.channel.addSystemMessage(
        currentChannel,
        `"${username}" nicks: ${Array.from(user.nicks).join(', ')}`,
      );
    }
  },
};
/**
 * Kick user from channel(s).
 * `/kick <channel> <username> [reason]`
 */
export const kick: TODO = null;
/**
 * Get list of bans
 * `/banlist`
 */
export const banlist: TODO = null;
/**
 * Change your nickname.
 * `/changenick <newNick>`
 */
export const changenick: TODO = null;

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
