import type { Channel, Message } from '#models';
import { parseNick, sortedInsert } from '#utils';
import { defineStore } from 'pinia';
import { computed, reactive, readonly, ref, watch } from 'vue';
import useIrcStore from './irc';
import { useWindowFocus } from '@vueuse/core';
import useNotificationsStore from './notifications';
import log from 'loglevel';
import useUserListStore from './user-list';

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
  function getChannel(channelName: string) {
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

  const activeTarget = ref('#general');
  function changeActiveChannel(channel: string) {
    activeTarget.value = channel;
  }
  function joinChannel(channel: string) {
    if (!irc.client) {
      return;
    }
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
    const channel = getChannel(channelName);
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
    const channel = getChannel(channelName);
    channel.hasMention = false;
    channel.hasNotification = false;
  }

  function getTargetChannel(nick: string, target: string) {
    const username = parseNick(nick);
    if (target.startsWith('#')) {
      return getChannel(target);
    }
    return getChannel(username);
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
        .on('action', (event) => {
          log.debug('ACTION', event);
        })
        .on('notice', (event) => {
          log.debug('NOTICE', event);
        })
        .on('privmsg', (event) => {
          log.debug('PRIVMSG', event);
          const { message, nick, target, tags } = event;
          const username = parseNick(nick);
          const channel = getTargetChannel(nick, target);
          // Remove typing status if user sent something
          channel.usersTyping.delete(username);

          const highlightedMessage = highlightKeywords(message);
          const newMessage: Message = {
            id: event.tags.msgid ?? crypto.randomUUID(),
            time: event.time ?? Date.now(),
            starred: false,
            message: highlightedMessage,
            target,
            nick,
            type: 'privmsg',
            tags: tags ?? {},
          };
          // TODO: Cap messages per channel (100)
          // TODO: Prevent duplicate message insertions with `id` value
          log.debug('new message:', newMessage);
          sortedInsert(channel.messages, newMessage, (a, b) => a.time - b.time);

          if (typeof newMessage.tags.batch === 'string') {
            // Don't trigger notifications on chat history playback
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
                message.toLocaleLowerCase().includes(irc.currentUser.username.toLocaleLowerCase())
              ) {
                channel.hasMention = true;
              }
            } else if (
              notifications.notificationKeywords.some((keyword) => message.includes(keyword))
            ) {
              sendMessageNotification(channel.name, newMessage);
            }
          } else {
            markAsRead(channel.name);
          }
        });
    },
  );

  // TODO: Add addSystemMessage method
  return {
    channelList,
    activeChannel: computed(() => readonly(getChannel(activeTarget.value))),
    changeActiveChannel,
    joinChannel,
    leaveChannel,
  };
});

export default useChannelStore;
