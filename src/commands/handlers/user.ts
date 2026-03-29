import type { CommandHandler, TODO } from '#models';

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
/**
 * Hide messages from a user.
 * `/ignore <username>`
 */
export const ignore: TODO = null;
/**
 * Show currently ignored users.
 * `/ignore-list`
 */
export const ignoreList: TODO = null;
/**
 * Show messages from user.
 */
export const unignore: TODO = null;
/**
 * Disconnect from chat.
 * `/disconnect`
 */
export const disconnect: TODO = null;

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
  description: 'Set self as unaway/back.',
  usage: '/unaway',
  execute({ stores }) {
    stores.profile.setUnaway();
  },
};
