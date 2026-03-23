import type { CommandHandler, TODO } from '#models';
import {
  getNamedColor,
  isAccessibleColor,
  isAccessibleHexColor,
  NAMED_COLORS,
  rgbToHex,
} from '#utils';

/**
 * Change custom emoticon slot.
 * `/emoticon <slot#> <emoticon>`
 */
export const emoticon: TODO = null;
/**
 * Get list of custom emoticons.
 * `/emoticon-list`
 */
export const emoticonList: TODO = null;
/**
 * Change notification indicator that appears in page title.
 * `/indicator <indicator>`
 */
export const indicator: TODO = null;
/**
 * Update font size.
 * `/size <newFontSize>`
 * Aliases: `/textsize`, `/fontsize`
 */
export const size: CommandHandler = {
  name: 'size',
  aliases: ['textsize', 'fontsize'],
  description: 'Update font size (px). Min: 10; Max: 18.',
  usage: '/size <number>',
  examples: ['/size 14'],
  execute({ currentChannel: target, args, stores }) {
    const value = Number.parseInt(args[0], 10);
    if (Number.isNaN(value)) {
      stores.channel.addSystemMessage(target, `${args[0]} is not a number`);
      return;
    }
    stores.settings.setFontSize(value);
  },
};
/**
 * View/update notification keywords.
 * - `/keywords`
 * - `/keywords add <keywords>`
 * - `/keywords remove <keywords>`
 */
export const keywords: TODO = null;
/**
 * - `/notifications`
 * - `/notifications enable <channel>`
 * - `/notifications disable <channel>`
 */
export const notifications: TODO = null;

export const color: CommandHandler = {
  name: 'color',
  description:
    'Set username color. Supports hex, RGB, or a preset color name. Ignores unreadable colors.',
  usage: '/color <color>',
  examples: ['/color #ffffff', '/color 255 255 255', '/color orange'],
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(currentChannel, '"/color" requires a color input');
      return;
    }

    let inputColor: string;

    if (args.length >= 3) {
      const r = Number.parseInt(args[0], 10);
      const g = Number.parseInt(args[1], 10);
      const b = Number.parseInt(args[2], 10);

      if (!isAccessibleColor(r, g, b)) {
        // RGB input
        stores.channel.addSystemMessage(
          currentChannel,
          `${r}, ${g}, ${b} is not a readable color.`,
        );
        return;
      }
      inputColor = rgbToHex(r, g, b);
    } else if (args[0].startsWith('#')) {
      // HEX input
      if (!isAccessibleHexColor(args[0])) {
        stores.channel.addSystemMessage(currentChannel, `${args[0]} is not a readable color.`);
        return;
      }
      inputColor = args[0];
    } else {
      // Named color input
      const namedColor = getNamedColor(args[0]);
      if (!namedColor) {
        stores.channel.addSystemMessage(currentChannel, `${args[0]} is not a preset color.`);
        stores.channel.addSystemMessage(
          currentChannel,
          `Available colors: ${Object.keys(NAMED_COLORS).join(', ')}`,
        );
        return;
      }

      inputColor = namedColor;
    }

    stores.settings.usernameColor = inputColor;
    if (currentChannel.startsWith('#')) {
      stores.irc.client?.tagmsg(currentChannel, { ['+color']: inputColor });
    }
  },
};
/**
 * Toggle chat feature.
 * `/toolbar enable <chatFeature>`
 * `/toolbar disable <chatFeature>`
 */
export const toolbar: TODO = null;
