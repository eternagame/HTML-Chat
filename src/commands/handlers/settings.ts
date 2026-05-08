import type { CommandHandler } from '#models';

export const size: CommandHandler = {
  name: 'size',
  aliases: ['textsize', 'fontsize'],
  description: 'Update font size (px). Min: 10; Max: 18.',
  usage: '/size <number>',
  examples: ['/size 14'],
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(`"/size" requires a number`);
      return;
    }

    const value = Number.parseInt(args[0], 10);
    if (Number.isNaN(value)) {
      stores.channel.addSystemMessage(`${args[0]} is not a number`);
      return;
    }
    stores.settings.setFontSize(value);
  },
};

export const keywords: CommandHandler = {
  name: 'keywords',
  aliases: ['keyword'],
  description: 'View/update notification keywords',
  usage: '/keywords [<add/remove> <keywords>]',
  examples: ['/keywords', '/keywords add something', '/keywords remove something'],
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(
        stores.notifications.keywords.size === 0
          ? 'No keywords set.'
          : `Current keywords: ${Array.from(stores.notifications.keywords).join(', ')}`,
      );
    } else if (args.length > 1) {
      const [action, ...textParts] = args;
      const keyword = textParts.join(' ');

      switch (action.toLocaleLowerCase()) {
        case 'add':
          stores.notifications.addKeyword(keyword);
          break;
        case 'remove':
          stores.notifications.removeKeyword(keyword);
          break;
      }
    }
  },
};
