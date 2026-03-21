import { createCommandRegistry } from '#commands';
import type { MessageType } from '#models';
import { isAccessibleHexColor } from '#utils';
import type { Tags } from 'irc-framework';
import { defineStore } from 'pinia';
import useChannelStore from './channel';
import useIrcStore from './irc';
import useSettingsStore from './settings';
import useUserListStore from './user-list';

const useChatStore = defineStore('chat', () => {
  const channel = useChannelStore();
  const irc = useIrcStore();
  const settings = useSettingsStore();
  const userList = useUserListStore();

  const commandRegistry = createCommandRegistry();

  function sendMessage(
    channelOrUsername: string,
    text: string,
    type: Exclude<MessageType, 'system'> = 'privmsg',
  ) {
    if (!irc.client) {
      return;
    }

    /*
     * Gather IRC targets for the messages
     * - Single target if it's a #channel
     * - One or more targets (NICKs) if it's a username
     */
    const targets: string[] = [];
    if (channelOrUsername.startsWith('#')) {
      targets.push(channelOrUsername);
    } else {
      const targetUser = userList.getUserByUsername(channelOrUsername);
      if (!targetUser || targetUser.status === 'offline') {
        // Do not attempt to send message if the user is offline
        channel.addSystemMessage(channelOrUsername, `${channelOrUsername} is currently offline.`);
        return;
      }

      // Send message to user to each NICK
      // User will only have multiple if the chat is opened in multiple tabs/windows
      targetUser.nicks.forEach((nick) => targets.push(nick));
    }

    // Add necessary metadata for pending messages or username colors
    const tags: Tags = {};
    const pendingId = channel.addPendingMessage(channelOrUsername, text, type);
    tags['label'] = pendingId;
    if (settings.usernameColor && isAccessibleHexColor(settings.usernameColor)) {
      tags['+color'] = settings.usernameColor;
    }

    for (const target of targets) {
      switch (type) {
        case 'notice':
          irc.client.notice(target, text, tags);
          break;
        case 'action':
          // `client.action()` is missing the `tags` parameter
          irc.client.say(target, `\u0001ACTION ${text}\u0001`, tags);
          break;
        default:
          irc.client.say(target, text, tags);
          break;
      }
    }
  }

  function handleUserInput(rawInput: string) {
    const isCommand = rawInput.startsWith('/');

    if (isCommand) {
      const [rawCommand, ...args] = rawInput.split(' ');
      // Remove `/` for matching against registry
      const commandName = rawCommand.substring(1).toLowerCase();
      const handler = commandRegistry.get(commandName);
      if (handler) {
        handler.execute({
          target: channel.currentChannelName,
          args,
          fullText: args.join(' '),
          sendMessage,
          stores: {
            channel,
            irc,
            settings,
            userList,
          },
        });
      } else {
        channel.addSystemMessage(
          channel.currentChannelName,
          `/${commandName} is not a recognized command.`,
        );
      }
    } else {
      sendMessage(channel.currentChannelName, rawInput, 'privmsg');
    }
  }

  return { handleUserInput };
});

export default useChatStore;
