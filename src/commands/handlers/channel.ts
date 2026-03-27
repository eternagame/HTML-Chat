import type { CommandHandler } from '#models';

export const join: CommandHandler = {
  name: 'join',
  description: 'Join and go to a channel.',
  usage: '/join <channel>',
  examples: ['/join #random'],
  execute({ args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('Select a channel using /join <channel>');
      return;
    }

    const inputChannel = args[0];
    if (!inputChannel.startsWith('#')) {
      stores.channel.addSystemMessage('Selected channel must start with a "#" sign.');
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
  examples: ['/goto #general', '/goto username'],
  execute({ currentChannel, args, stores }) {
    if (args.length === 0) {
      stores.channel.addSystemMessage('Select a channel using /goto <channel>');
      stores.channel.addSystemMessage(
        `Channels currently available are: ${stores.channel.channelNameList.join(', ')}`,
      );
      return;
    }

    const inputChannel = args[0].toLocaleLowerCase();
    if (inputChannel === currentChannel) {
      stores.channel.addSystemMessage(`You are already in ${inputChannel}.`);
      return;
    }
    stores.channel.goToChannel(inputChannel);
  },
};
