import type { Channel, Message, MessageType } from '#models';
import { parseNick, sortedInsert } from '#utils';
import { useWindowFocus } from '@vueuse/core';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed, reactive, readonly, ref, watch } from 'vue';
import useIrcStore from './irc';
import useNotificationsStore from './notifications';
import useUserListStore from './user-list';

const MAX_MESSAGES_PER_CHANNEL = 500;

const useChannelStore = defineStore('channel', () => {
  const irc = useIrcStore();
  const notifications = useNotificationsStore();
  const userList = useUserListStore();
  const isFocusedWindow = useWindowFocus();
  const channelMap = reactive(new Map<string, Channel>());
  const channelList = computed(() => Array.from(channelMap.keys()));

  /**
   * Gets channel from list.
   * Adds channel if not previously tracked.
   */
  function createOrGetChannel(channelName: string) {
    if (!channelMap.has(channelName)) {
      // Add new channel if not found
      channelMap.set(channelName, {
        name: channelName,
        banStatus: 'normal',
        messages: [],
        usersTyping: new Set(),
        notificationsEnabled: true,
        hasMention: false,
        hasNotification: false,
      });
    }
    return channelMap.get(channelName)!;
  }

  const activeTarget = ref('');
  function changeActiveChannel(channel: string) {
    activeTarget.value = channel;
  }
  const activeChannel = computed(() => {
    const channel = channelMap.get(activeTarget.value);
    return channel ? readonly(channel) : null;
  });
  const activeMessages = computed(() => activeChannel.value?.messages ?? []);

  function joinChannel(channel: string) {
    if (!irc.client) {
      return;
    }
    createOrGetChannel(channel);
    const newChannel = irc.client.channel(channel);
    newChannel.updateUsers();
    changeActiveChannel(channel);
  }
  function leaveChannel(channel: string) {
    if (!irc.client) {
      return;
    }

    irc.client.part(channel);
    const otherChannels = channelList.value.filter((c) => c !== channel);
    if (otherChannels.length > 0) {
      changeActiveChannel(otherChannels[0]);
      channelMap.delete(channel);
    }
  }

  async function sendMessageNotification(channelName: string, message: Message) {
    const user = userList.getUser(message.nick);
    const channel = createOrGetChannel(channelName);
    channel.hasNotification = true;

    notifications.sendNotification(
      {
        title: `New message in ${channel.name}`,
        body: `${user.username}: ${message.message}`,
        tag: `new-message-${message.target}`,
      },
      () => {
        // Open channel if notification is clicked
        changeActiveChannel(channel.name);
      },
    );
  }

  function markAsRead(channelName: string) {
    const channel = createOrGetChannel(channelName);
    channel.hasMention = false;
    channel.hasNotification = false;
  }

  function getTargetChannel(nick: string, target: string) {
    const username = parseNick(nick);
    if (target.startsWith('#')) {
      return createOrGetChannel(target);
    }
    return createOrGetChannel(username);
  }

  function addMessageInternal(channelName: string, message: Message) {
    const channel = createOrGetChannel(channelName);
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

  function addSystemMessage(channelName: string, text: string) {
    const systemMessage: Message = {
      id: `system-${crypto.randomUUID()}`,
      time: Date.now(),
      starred: false,
      message: text,
      target: channelName,
      nick: 'System',
      username: 'System',
      type: 'system',
      tags: {},
    };
    addMessageInternal(channelName, systemMessage);
  }

  function addPendingMessage(
    channelName: string,
    text: string,
    messageType: Exclude<MessageType, 'system'> = 'privmsg',
  ) {
    const pendingId = `${crypto.randomUUID()}`;
    addMessageInternal(channelName, {
      id: `pending-${pendingId}`,
      time: Date.now(),
      starred: false,
      message: text,
      target: channelName,
      nick: irc.currentNick,
      username: irc.currentUser.username,
      type: messageType,
      status: 'pending',
      tags: { label: pendingId },
      pendingId,
    });
    return pendingId;
  }

  function highlightKeywords(message: string): string {
    if (notifications.notificationKeywords.length === 0) {
      return message;
    }

    let highlighted = message;
    for (const keyword of notifications.notificationKeywords) {
      highlighted = highlighted.replace(` ${keyword}`, ` |${keyword}|`);
    }
    return highlighted;
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

          const username = parseNick(event.nick);
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
          log.debug(`[${event.type}]`, event);
          const username = parseNick(event.nick);
          const channel = getTargetChannel(event.nick, event.target);
          // Remove typing status if user sent something
          channel.usersTyping.delete(username);

          const highlightedMessage = highlightKeywords(event.message);
          const newMessage: Message = {
            id: event.tags.msgid ?? `message-${crypto.randomUUID()}`,
            time: event.time ?? Date.now(),
            starred: false,
            message: highlightedMessage,
            target: event.target,
            nick: event.nick,
            username,
            type: event.type,
            tags: event.tags ?? {},
          };

          const isMe = username === irc.currentUser.username;
          if (isMe) {
            // Check if incoming message from self is the one sent recently
            const pendingIndex = channel.messages.findLastIndex(
              (m) =>
                m.status === 'pending' &&
                (m.pendingId === event.tags.label || m.message === event.message),
            );

            if (pendingIndex !== -1) {
              // Mark incoming message as successful sent if it was pending
              newMessage.status = 'sent';
              newMessage.pendingId = channel.messages[pendingIndex].pendingId;
              // Remove pending version so that incoming message is inserted correctly
              channel.messages.splice(pendingIndex, 1);
            }
          }

          addMessageInternal(channel.name, newMessage);

          if (isMe || typeof newMessage.tags.batch === 'string') {
            // Don't notify on self or chat history playback
            return;
          }

          // If the user has allows for notifications on channel or keywords
          // Display/send notifications if user is in another channel or has browser blurred
          // Otherwise mark channel as read if user is actively viewing the channel
          const isOtherChannel = channel.name !== activeTarget.value;
          if (!isFocusedWindow || isOtherChannel) {
            if (channel.notificationsEnabled) {
              sendMessageNotification(channel.name, newMessage);

              if (
                highlightedMessage
                  .toLocaleLowerCase()
                  .includes(irc.currentUser.username.toLocaleLowerCase())
              ) {
                channel.hasMention = true;
              }
            } else if (
              notifications.notificationKeywords.some((keyword) =>
                highlightedMessage.includes(keyword),
              )
            ) {
              sendMessageNotification(channel.name, newMessage);
            }
          } else {
            markAsRead(channel.name);
          }
        });
    },
  );

  return {
    channelList,
    activeChannelName: readonly(activeTarget),
    activeChannel,
    activeMessages,
    changeActiveChannel,
    addSystemMessage,
    addPendingMessage,
    joinChannel,
    leaveChannel,
  };
});

export default useChannelStore;
