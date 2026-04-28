import {
  CODE_OF_CONDUCT_MESSAGE,
  DEFAULT_CHANNELS,
  OPERATOR_NOTIFICATION_CHANNEL,
} from '#constants';
import type { Channel, Message, MessageType } from '#models';
import {
  containsWords,
  highlightWords,
  isCaseInsensitiveMatch,
  isDefaultChannel,
  isMaskMatch,
  parseNick,
  sortedInsert,
} from '#utils';
import { useLocalStorage, useWindowFocus } from '@vueuse/core';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, reactive, readonly, watch } from 'vue';
import { useIrcStore } from './irc.store';
import { useNotificationsStore } from './notifications.store';
import { useUserListStore } from './user-list.store';

const MAX_MESSAGES_PER_CHANNEL = 500;

export const useChannelStore = defineStore('channel', () => {
  const irc = useIrcStore();
  const notifications = useNotificationsStore();
  const userList = useUserListStore();
  const isFocusedWindow = useWindowFocus();
  const channelMap = reactive(new Map<string, Channel>());
  const channelNameList = computed(() => Array.from(channelMap.keys()));
  const channelList = computed(() => Array.from(channelMap.values()));
  const joinedChannels = useLocalStorage<Set<string>>(
    'chat_joinedChannels',
    new Set(DEFAULT_CHANNELS),
  );
  const currentChannelName = useLocalStorage<string>(
    'chat_currentChannelName',
    Array.from(DEFAULT_CHANNELS)[0],
  );
  const silencedChannels = useLocalStorage<Set<string>>('chat_silencedChannels', new Set<string>());
  const currentChannel = computed(() => {
    const channel = channelMap.get(currentChannelName.value);
    return channel ? readonly(channel) : null;
  });
  const currentMessages = computed(() => currentChannel.value?.messages ?? []);
  const hasNotification = computed(() =>
    Array.from(channelMap.values()).some((c) => c.hasNotification),
  );
  const hasMention = computed(() => Array.from(channelMap.values()).some((c) => c.hasMention));

  /**
   * Gets channel from list.
   * Adds channel if not previously tracked.
   */
  function createOrGetChannel(channelOrUsername: string): Channel {
    const displayName = channelOrUsername;
    const channelName = displayName.toLocaleLowerCase();
    if (!channelMap.has(channelName)) {
      // Add new channel if not found
      channelMap.set(channelName, {
        name: channelName,
        displayName,
        banStatus: 'normal',
        messages: [],
        usersTyping: new Set(),
        notificationsEnabled: !silencedChannels.value.has(channelName),
        hasMention: false,
        hasNotification: false,
      });
    }
    return channelMap.get(channelName)!;
  }

  function toggleChannelNotifications(channelOrUsername: string, force?: boolean) {
    const channel = channelMap.get(channelOrUsername.toLocaleLowerCase());
    if (!channel) {
      return;
    }

    if (force || !channel.notificationsEnabled) {
      channel.notificationsEnabled = true;
      silencedChannels.value.delete(channel.name);
    } else if (force === false || channel.notificationsEnabled) {
      channel.notificationsEnabled = false;
      silencedChannels.value.add(channel.name);
      markAsRead(channel.name);
    }
  }

  function goToChannel(channelOrUsername: string) {
    const channelName = channelOrUsername.toLocaleLowerCase();
    if (channelMap.has(channelName)) {
      currentChannelName.value = channelName;
      markAsRead(channelName);
    } else {
      addSystemMessage(`Unknown channel: ${channelOrUsername}`);
    }
  }

  function requestChatHistory(channelOrUsername: string) {
    if (!irc.client || !channelOrUsername.startsWith('#')) {
      // Skip requests for user channels
      return;
    }
    irc.client.raw(`CHATHISTORY LATEST ${channelOrUsername} * ${MAX_MESSAGES_PER_CHANNEL}`);
  }

  function joinChannel(
    channelOrUsername: string,
    opts: Partial<{ force: boolean; skipNavigation: boolean }> = {},
  ) {
    if (!irc.client) {
      return;
    }

    const options = { force: false, skipNavigation: false, ...opts };
    const channelName = channelOrUsername.toLocaleLowerCase();

    if (options.force || !channelMap.has(channelName)) {
      createOrGetChannel(channelName);

      if (channelName.startsWith('#')) {
        // JOIN IRC channel and request users / chat history
        const newChannel = irc.client.channel(channelName);
        newChannel.updateUsers();
        requestChatHistory(channelName);
      }
    }

    joinedChannels.value.add(channelName);
    if (!options.skipNavigation) {
      goToChannel(channelName);
    }
  }

  /**
   * Re-JOIN channels on application start or on client reconnection
   */
  function rejoinChannels() {
    if (joinedChannels.value.size === 0) {
      return;
    }

    const lastActiveChannel = currentChannelName.value;

    const channels = Array.from(joinedChannels.value);
    for (const channel of channels) {
      joinChannel(channel, { force: true, skipNavigation: true });
    }

    if (lastActiveChannel.length === 0) {
      goToChannel(channels[0]);
    }
  }

  function leaveChannel(channelOrUsername: string) {
    if (!irc.client) {
      return;
    }

    const channelName = channelOrUsername.toLocaleLowerCase();
    const isCurrentChannel = currentChannelName.value === channelName;

    // Avoid leaving default channels
    if (isDefaultChannel(channelName)) {
      addSystemMessage(`You cannot leave ${channelName}.`);
      return;
    }

    if (isCurrentChannel) {
      const otherChannels = channelNameList.value.filter((c) => c !== channelName);
      if (otherChannels.length === 0) {
        // Avoid leaving last channel
        addSystemMessage('Join another channel before leaving this one.');
        return;
      }

      // Change to a different channel upon leaving
      goToChannel(otherChannels[0]);
    }

    joinedChannels.value.delete(channelName);
    channelMap.delete(channelName);
    if (channelName.startsWith('#')) {
      irc.client.part(channelName);
    }
  }

  async function sendMessageNotification(channelOrUsername: string, message: Message) {
    const channel = createOrGetChannel(channelOrUsername);
    channel.hasNotification = true;
    notifications.sendNotification(
      {
        title: `New message in ${channel.name}`,
        body: `${message.username}: ${message.message}`,
        tag: `new-message-${message.target}`,
      },
      () => {
        // Open channel if notification is clicked
        goToChannel(channel.name);
      },
    );
  }

  function markAsRead(channelOrUsername: string) {
    const channelName = channelOrUsername.toLocaleLowerCase();
    const channel = channelMap.get(channelName);
    if (channel) {
      channel.hasMention = false;
      channel.hasNotification = false;
    }
  }

  function getTargetChannel(nick: string, target: string): Channel {
    if (target.startsWith('#')) {
      return createOrGetChannel(target);
    }

    let username: string;
    if (isCaseInsensitiveMatch(nick, irc.currentNick)) {
      // This is an echo message from myself to another
      username = userList.getUserByNick(target)?.username ?? irc.currentUser.username;
    } else {
      // Is a message from another user to myself
      username = userList.getUserByNick(nick)?.username ?? parseNick(nick).toLocaleLowerCase();
    }
    return createOrGetChannel(username);
  }

  function addMessageInternal(channelOrUsername: string, message: Message) {
    const channel = createOrGetChannel(channelOrUsername);
    if (channel.messages.some((m) => m.id === message.id)) {
      // Do not add duplicate messages
      return;
    }
    sortedInsert(channel.messages, message, (a, b) => a.time - b.time);
    if (channel.messages.length > MAX_MESSAGES_PER_CHANNEL) {
      // Remove oldest messages when message count limit is reached
      channel.messages.splice(0, channel.messages.length - MAX_MESSAGES_PER_CHANNEL);
    }
  }

  /**
   * Display system message in channel messages
   * @param channelOrUsername Defaults to current channel if not specified
   */
  function addSystemMessage(text: string, channelOrUsername: string = currentChannelName.value) {
    const systemMessage: Message = {
      id: `system-${crypto.randomUUID()}`,
      time: Date.now(),
      message: text,
      type: 'system',

      // The rest of these fields are irrelevant for rendering system messages
      // Only defining them for satisfying Message model type
      target: channelOrUsername,
      nick: 'System',
      username: 'System',
      tags: {},
    };
    addMessageInternal(channelOrUsername, systemMessage);
  }

  function addPendingMessage(
    channelOrUsername: string,
    text: string,
    messageType: Exclude<MessageType, 'system'> = 'privmsg',
  ) {
    const pendingId = `${crypto.randomUUID()}`;
    addMessageInternal(channelOrUsername, {
      id: `pending-${pendingId}`,
      time: Date.now(),
      message: text,
      nick: irc.currentNick,
      username: irc.currentUser.username,
      type: messageType,

      // Necessary for tracking pending status later
      tags: { label: pendingId },
      status: 'pending',
      pendingId,

      // Irrelevant for rendering pending messages
      target: channelOrUsername,
    });
    markAsRead(channelOrUsername);
    return pendingId;
  }

  // Track typing users
  watch(
    () => irc.client,
    (client) => {
      if (!client) {
        return;
      }

      client
        .on('tagmsg', (event) => {
          // See https://ircv3.net/specs/client-tags/typing
          const typing = event.tags['+typing'];
          if (typeof typing !== 'string') {
            return;
          }

          const user = userList.getUserByNick(event.nick);
          const username = user?.username ?? parseNick(event.nick).toLocaleLowerCase();
          const channel = getTargetChannel(event.nick, event.target);
          switch (typing) {
            case 'active':
              channel.usersTyping.add(username);
              break;

            case 'paused':
            case 'done':
            default:
              channel.usersTyping.delete(username);
              break;
          }
        })
        .on('message', (event) => {
          if (event.type === 'notice' && event.nick === '') {
            addSystemMessage(event.message);
            return;
          }
          if (
            isCaseInsensitiveMatch(event.target, OPERATOR_NOTIFICATION_CHANNEL) &&
            !irc.isOperator
          ) {
            // Ignore echoed messages to the operator notification channel
            // If user is not an operator
            return;
          }

          const user = userList.getUserByNick(event.nick);
          const username = user?.username ?? parseNick(event.nick).toLocaleLowerCase();
          const channel = getTargetChannel(event.nick, event.target);
          // Remove typing status if user sent something
          channel.usersTyping.delete(username);

          const highlightedMessage = highlightWords(event.message, notifications.keywords);
          const newMessage: Message = {
            id: event.tags.msgid ?? `message-${crypto.randomUUID()}`,
            time: event.time ?? Date.now(),
            message: highlightedMessage,
            target: event.target,
            nick: event.nick,
            username,
            type: event.type,
            tags: event.tags ?? {},
          };

          const isCurrentChannel = channel.name === currentChannelName.value;
          const isMe = username === irc.currentUser.username;

          if (isMe) {
            // Check if incoming message from self is the one sent recently
            const sentMessage = channel.messages.findLast(
              (m) => typeof m.status === 'string' && m.pendingId === event.tags.label,
            );

            if (sentMessage) {
              if (sentMessage.status === 'pending') {
                // Mark incoming message as successful sent if it was pending
                Object.assign(sentMessage, newMessage, { status: 'sent' });
              }
              // Prevents duplicate sent message from being added if `status === 'sent'`
              // Only occurs when private messaging a user with 2+ clients open
              return;
            }
          }

          addMessageInternal(channel.name, newMessage);

          // #region notification
          if (
            typeof newMessage.tags.batch === 'string' ||
            isMe ||
            (isCurrentChannel && isFocusedWindow.value)
          ) {
            // Don't notify on:
            // - chat history playback
            // - self
            // - currently focused channel
            markAsRead(channel.name);
          } else {
            // Notify if user is in another channel or has browser blurred
            if (channel.notificationsEnabled) {
              sendMessageNotification(channel.name, newMessage);

              if (
                newMessage.message
                  .toLocaleLowerCase()
                  .includes(irc.currentUser.username.toLocaleLowerCase())
              ) {
                channel.hasMention = true;
              }
            } else if (containsWords(newMessage.message, notifications.keywords)) {
              sendMessageNotification(channel.name, newMessage);
            }
          }
          // #endregion
        })
        .on('connected', () => {
          // After successful client reconnection
          rejoinChannels();
        })
        .on('irc error', (event) => {
          log.debug('[IRC Error]', event);

          if (event.error === 'invite_only_channel') {
            leaveChannel(event.channel);
          } else if (event.error === 'banned_from_channel') {
            addSystemMessage(`You have been banned.`, event.channel);
            addSystemMessage(CODE_OF_CONDUCT_MESSAGE, event.channel);
            createOrGetChannel(event.channel).banStatus = 'banned';
          }
        })
        .on('kick', (event) => {
          if (event.kicked !== irc.currentNick || typeof event.tags.batch === 'string') {
            return;
          }

          addSystemMessage(`You have been kicked from ${event.channel}`, event.channel);
          addSystemMessage(CODE_OF_CONDUCT_MESSAGE, event.channel);
          createOrGetChannel(event.channel).banStatus = 'banned';
        })
        .on('mode', (event) => {
          if (!event.target.startsWith('#')) {
            // Only caring about channel-related mode events
            return;
          }

          const channel = createOrGetChannel(event.target);

          for (const mode of event.modes) {
            // Listen for mode events only for the current user nick
            if (!mode.param || !isMaskMatch(irc.currentNick, mode.param)) {
              continue;
            }

            switch (mode.mode) {
              case '+b': {
                if (mode.param.startsWith('m:')) {
                  // Muted
                  if (!event.batch) {
                    addSystemMessage(`You have been muted.`, event.target);
                    addSystemMessage(CODE_OF_CONDUCT_MESSAGE, event.target);
                  }
                  createOrGetChannel(event.target).banStatus = 'muted';
                } else {
                  // Banned
                  if (!event.batch) {
                    addSystemMessage(`You have been banned.`, event.target);
                    addSystemMessage(CODE_OF_CONDUCT_MESSAGE, event.target);
                  }
                  createOrGetChannel(event.target).banStatus = 'banned';
                }

                break;
              }

              case '-b': {
                channel.banStatus = 'normal';

                if (!event.batch) {
                  if (mode.param.startsWith('m:')) {
                    // Unmuted
                    addSystemMessage(`You have been unmuted.`, event.target);
                  } else {
                    // Unbanned
                    addSystemMessage(`You have been unbanned.`, event.target);
                  }
                }
                break;
              }
            }
          }
        });

      rejoinChannels();
    },
  );

  watch(isFocusedWindow, (isFocused) => {
    // Auto-mark current channel as read when focusing window
    if (isFocused) {
      markAsRead(currentChannelName.value);
    }
  });

  return {
    channelList,
    channelNameList,
    currentChannel,
    currentChannelName: readonly(currentChannelName),
    currentMessages: readonly(currentMessages),
    hasNotification: readonly(hasNotification),
    hasMention,
    markAsRead,
    getChannel(channelOrUsername: string) {
      const channel = channelMap.get(channelOrUsername.toLocaleLowerCase());
      return channel ? readonly(channel) : null;
    },
    toggleChannelNotifications,
    goToChannel,
    addSystemMessage,
    addPendingMessage,
    joinChannel,
    leaveChannel,
  };
});
