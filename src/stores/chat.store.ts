import { createCommandRegistry } from '#commands';
import type { MessageType } from '#models';
import type { Tags } from 'irc-framework';
import { defineStore } from 'pinia';
import { useChannelStore } from './channel.store';
import { useIrcStore } from './irc.store';
import { useOperatorStore } from './operator.store';
import { useProfileStore } from './profile.store';
import { useSettingsStore } from './settings.store';
import { useUserListStore } from './user-list.store';

export const useChatStore = defineStore('chat', () => {
  const channel = useChannelStore();
  const irc = useIrcStore();
  const operator = useOperatorStore();
  const profile = useProfileStore();
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

    const targetChannel = channel.getChannel(channelOrUsername);
    if (targetChannel && targetChannel.banStatus !== 'normal') {
      channel.addSystemMessage(`You cannot chat here. You have been ${targetChannel.banStatus}.`);
      channel.addSystemMessage(
        'Please read our [code of conduct](https://eternagame.org/about/conduct)',
      );
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
        channel.addSystemMessage(`${channelOrUsername} is currently offline.`);
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
    if (profile.usernameColor) {
      tags['+color'] = profile.usernameColor;
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
      const [rawCommand, ...args] = rawInput.split(/\s+/g);
      // Remove `/` for matching against registry
      const commandName = rawCommand.substring(1).toLowerCase();
      const handler = commandRegistry.get(commandName);
      if (handler) {
        if (handler.requiresOperator && !irc.isOperator) {
          // Check if user is operator for operator-only commands
          channel.addSystemMessage(`You need to be an operator to run: "/${commandName}"`);
          return;
        }

        handler.execute({
          currentChannel: channel.currentChannelName,
          args,
          fullText: args.join(' '),
          sendMessage,
          stores: {
            channel,
            irc,
            operator,
            profile,
            settings,
            userList,
          },
        });
      } else {
        channel.addSystemMessage(`/${commandName} is not a recognized command.`);
      }
    } else {
      sendMessage(channel.currentChannelName, rawInput, 'privmsg');
    }
  }

  return { handleUserInput };
});
