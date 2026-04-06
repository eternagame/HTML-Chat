import { DEFAULT_COLORS, IDLE_TIMEOUT } from '#constants';
import { isAccessibleHexColor, random } from '#utils';
import { useIdle, useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { readonly, ref, watch } from 'vue';
import { useChannelStore } from './channel.store';
import { useIrcStore } from './irc.store';

export const useProfileStore = defineStore('profile', () => {
  const irc = useIrcStore();
  const channel = useChannelStore();

  const usernameColor = useLocalStorage('chat_usernameColor', random(DEFAULT_COLORS));
  const displayTypingStatus = useLocalStorage('chat_displayTypingStatus', true);

  const autoAwayEnabled = useLocalStorage('chat_autoAwayEnabled', true);
  const { idle } = useIdle(IDLE_TIMEOUT);
  const isManualAway = ref(false);
  const isAway = ref(false);
  const awayReason = ref('');

  function updateUsernameColor(color: string) {
    if (!isAccessibleHexColor(color)) {
      return;
    }
    usernameColor.value = color;
    if (channel.currentChannelName.startsWith('#')) {
      irc.client?.tagmsg(channel.currentChannelName, { ['+color']: usernameColor.value });
    }
  }

  function setAway(inputMessage?: string, manual = true) {
    let message = 'User is currently away';
    if (typeof inputMessage === 'string' && inputMessage.trim().length > 0) {
      message = inputMessage.trim();
    }
    isManualAway.value = manual;
    isAway.value = true;
    awayReason.value = message;
    irc.client?.raw(`AWAY :${message}`);
  }
  function setUnaway() {
    isManualAway.value = false;
    isAway.value = false;
    awayReason.value = '';
    irc.client?.raw('AWAY');
  }

  watch(idle, (isIdle) => {
    if (!autoAwayEnabled.value || isManualAway.value) {
      return;
    }

    if (isIdle) {
      setAway('User is currently away', false);
    } else {
      setUnaway();
    }
  });

  return {
    usernameColor: readonly(usernameColor),
    updateUsernameColor,
    displayTypingStatus,
    autoAwayEnabled,
    awayReason: readonly(awayReason),
    isAway: readonly(isAway),
    isManualAway: readonly(isManualAway),
    setAway,
    setUnaway,
  };
});
