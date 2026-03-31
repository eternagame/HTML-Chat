import { DEFAULT_COLORS } from '#constants';
import { isAccessibleHexColor, random } from '#utils';
import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { readonly } from 'vue';
import { useChannelStore } from './channel.store';
import { useIrcStore } from './irc.store';

export const useProfileStore = defineStore('profile', () => {
  const irc = useIrcStore();
  const channel = useChannelStore();

  const usernameColor = useLocalStorage('chat_usernameColor', random(DEFAULT_COLORS));
  const awayReason = useLocalStorage('chat_awayReason', '');
  const displayTypingStatus = useLocalStorage('chat_displayTypingStatus', true);

  function updateUsernameColor(color: string) {
    if (!isAccessibleHexColor(color)) {
      return;
    }
    usernameColor.value = color;
    if (channel.currentChannelName.startsWith('#')) {
      irc.client?.tagmsg(channel.currentChannelName, { ['+color']: usernameColor.value });
    }
  }

  function setAway(inputMessage?: string) {
    let message = 'User is currently away';
    if (typeof inputMessage === 'string' && inputMessage.trim().length > 0) {
      message = inputMessage.trim();
    }
    awayReason.value = message;
    irc.client?.raw(`AWAY :${message}`);
  }
  function setUnaway() {
    awayReason.value = '';
    irc.client?.raw('AWAY');
  }

  return {
    usernameColor: readonly(usernameColor),
    updateUsernameColor,
    awayReason: readonly(awayReason),
    setAway,
    setUnaway,
    displayTypingStatus,
  };
});
