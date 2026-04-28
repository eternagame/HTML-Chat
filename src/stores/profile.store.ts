import { IDLE_TIMEOUT } from '#constants';
import { useIdle, useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { readonly, ref, watch } from 'vue';
import { useIrcStore } from './irc.store';

export const useProfileStore = defineStore('profile', () => {
  const irc = useIrcStore();

  const displayTypingStatus = useLocalStorage('chat_displayTypingStatus', true);
  const autoAwayEnabled = useLocalStorage('chat_autoAwayEnabled', true);
  const { idle } = useIdle(IDLE_TIMEOUT);
  const isManualAway = ref(false);
  const isAway = ref(false);
  const awayReason = ref('');

  function setAway(inputMessage?: string, manual = true) {
    let message = 'Away';
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
      setAway('Away', false);
    } else {
      setUnaway();
    }
  });

  return {
    displayTypingStatus,
    autoAwayEnabled,
    awayReason: readonly(awayReason),
    isAway: readonly(isAway),
    isManualAway: readonly(isManualAway),
    setAway,
    setUnaway,
  };
});
