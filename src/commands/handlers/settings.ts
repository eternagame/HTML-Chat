import type { CommandHandler } from '#models';
import {
  getNamedColor,
  isAccessibleColor,
  isAccessibleHexColor,
  NAMED_COLORS,
  rgbToHex,
} from '#utils';

export const indicator: CommandHandler = {
  name: 'indicator',
  description: 'Change notification indicator that appears in page title',
  usage: '/indicator <indicator>',
  execute({ fullText, stores }) {
    if (fullText.length === 0) {
      stores.channel.addSystemMessage('"/indicator" requires the indicator text parameter');
      return;
    }
    stores.notifications.indicatorText = fullText;
  },
};

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

export const color: CommandHandler = {
  name: 'color',
  description:
    'Set username color. Supports hex, RGB, or a preset color name. Ignores unreadable colors.',
  usage: '/color <color>',
  examples: ['/color #ffffff', '/color 255 255 255', '/color orange'],
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('"/color" requires a color input');
      return;
    }

    let inputColor: string;

    if (args.length >= 3) {
      const r = Number.parseInt(args[0], 10);
      const g = Number.parseInt(args[1], 10);
      const b = Number.parseInt(args[2], 10);

      if (!isAccessibleColor(r, g, b)) {
        // RGB input
        stores.channel.addSystemMessage(`${r}, ${g}, ${b} is not a readable color.`);
        return;
      }
      inputColor = rgbToHex(r, g, b);
    } else if (args[0].startsWith('#')) {
      // HEX input
      if (!isAccessibleHexColor(args[0])) {
        stores.channel.addSystemMessage(`${args[0]} is not a readable color.`);
        return;
      }
      inputColor = args[0];
    } else {
      // Named color input
      const namedColor = getNamedColor(args[0]);
      if (!namedColor) {
        stores.channel.addSystemMessage(`${args[0]} is not a preset color.`);
        stores.channel.addSystemMessage(
          `Available colors: ${Object.keys(NAMED_COLORS).join(', ')}`,
        );
        return;
      }

      inputColor = namedColor;
    }

    stores.profile.updateUsernameColor(inputColor);
  },
};
