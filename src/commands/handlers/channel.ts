import type { CommandHandler } from '#models';

export const join: CommandHandler = {
  name: 'join',
  description: 'Join and go to a channel.',
  usage: '/join <channel>',
  examples: ['/join #random'],
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(currentChannel, 'Select a channel using /join <channel>');
      return;
    }

    const inputChannel = args[0];
    if (!inputChannel.startsWith('#')) {
      stores.channel.addSystemMessage(
        currentChannel,
        'Selected channel must start with a "#" sign.',
      );
      return;
    }
    stores.channel.joinChannel(inputChannel);
  },
};

export const leave: CommandHandler = {
  name: 'leave',
  description: 'Leave a channel. Defaults to current channel.',
  usage: '/leave [channel]',
  examples: ['/leave', '/leave #random', '/leave user'],
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.leaveChannel(currentChannel);
      return;
    }

    const inputChannel = args[0];
    stores.channel.leaveChannel(inputChannel);
  },
};

export const goto: CommandHandler = {
  name: 'goto',
  description: 'Switch channel.',
  usage: '/goto <channel>',
  examples: ['/goto #general', '#goto username'],
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage(currentChannel, 'Select a channel using /goto <channel>');
      stores.channel.addSystemMessage(
        currentChannel,
        `Channels currently available are: ${stores.channel.channelList.join(', ')}`,
      );
      return;
    }

    const inputChannel = args[0];
    if (inputChannel.toLocaleLowerCase().localeCompare(currentChannel.toLocaleLowerCase()) === 0) {
      stores.channel.addSystemMessage(currentChannel, `You are already in ${inputChannel}`);
      return;
    }
    const targetChannel = stores.channel.channelList.find(
      (c) => inputChannel.toLocaleLowerCase().localeCompare(c.toLocaleLowerCase()) === 0,
    );
    if (!targetChannel) {
      stores.channel.addSystemMessage(currentChannel, `Unknown channel: ${inputChannel}`);
      return;
    }
    stores.channel.goToChannel(targetChannel);
  },
};
