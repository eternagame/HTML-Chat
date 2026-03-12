import type { Channel, Message } from '#models';
import { parseNick } from '#utils';
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
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
        usersTyping: [],
        notificationsEnabled: true,
        hasMention: false,
        hasNotification: false,
      });
    }
    return channelMap.get(channelName)!;
  }

  const activeTarget = ref('#general');
  const activeChannel = computed(() => getChannel(activeTarget.value));

  function changeActiveChannel(channel: string) {
    activeTarget.value = channel;
  }
  function joinChannel(channel: string) {
    if (!irc.client) {
      return;
    }
    const newChannel = irc.client.channel(channel);
    newChannel.join();
    newChannel.updateUsers();
    getChannel(channel);
  }
  function leaveChannel(channel: string) {
    if (!irc.client) {
      return;
    }

    irc.client.part(channel);
    channelMap.delete(channel);
  }

  async function addMessageNotification(channelName: string, message: Message) {
    const channel = getChannel(channelName);
    channel.hasNotification = true;

    try {
      const notification = await notifications.sendNotification(
        `New message in ${channel.name}`,
        `${message.user.username}: ${message.message}`,
        `new-message-${message.target}`,
      );
      notification?.addEventListener('click', () => {
        // View channel if notification is clicked
        changeActiveChannel(channel.name);
      });
    } catch (err) {
      log.error('Notification error:', err);
    }
  }

  function markAsRead(channelName: string) {
    const channel = getChannel(channelName);
    channel.hasMention = false;
    channel.hasNotification = false;
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

      client.on('message', ({ message, nick, type, target, tags }) => {
        const username = parseNick(nick);
        const isPrivateMessage =
          type === 'privmsg' &&
          !target.startsWith('#') &&
          irc.currentUser.username === parseNick(target);
        const channel = isPrivateMessage ? getChannel(username) : getChannel(target);

        // TODO: Use `typing` client tag if `message-tags` capability is available
        // Handling typing status updates
        if (type === 'action' && message === 'is typing...') {
          if (!channel.usersTyping.includes(username)) {
            channel.usersTyping.push(username);
          }
          return;
        } else if (type === 'action' && message === 'is not typing...') {
          channel.usersTyping = channel.usersTyping.filter((u) => u !== username);
          return;
        }

        const user = userList.getUser(nick);
        const highlightedMessage = highlightKeywords(message);
        const newMessage: Message = {
          // TODO: Read from server time, if available
          time: new Date(),
          starred: false,
          message: highlightedMessage,
          target,
          user,
          type: 'message',
          tags: tags ?? {},
        };
        // TODO: Cap messages per channel (50)
        channel.messages.push(newMessage);

        // If the user has allows for notifications on channel or keywords
        // Display/send notifications if user is in another channel or has browser blurred
        // Otherwise mark channel as read if user is actively viewing the channel
        const isOtherChannel = channel.name !== activeTarget.value;
        if (!isFocusedWindow || isOtherChannel) {
          if (channel.notificationsEnabled) {
            addMessageNotification(channel.name, newMessage);

            if (
              message.toLocaleLowerCase().includes(irc.currentUser.username.toLocaleLowerCase())
            ) {
              channel.hasMention = true;
            }
          } else if (
            notifications.notificationKeywords.some((keyword) => message.includes(keyword))
          ) {
            addMessageNotification(channel.name, newMessage);
          }
        } else {
          markAsRead(channel.name);
        }
      });
    },
  );

  return {
    channelList,
    activeChannel,
    changeActiveChannel,
    joinChannel,
    leaveChannel,
  };
});

export default useChannelStore;
