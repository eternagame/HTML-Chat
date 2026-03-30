import { useLocalStorage, useWebNotification, type WebNotificationOptions } from '@vueuse/core';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { computed } from 'vue';

const useNotificationsStore = defineStore('notifications', () => {
  const indicatorText = useLocalStorage('chat_indicatorText', '(!)');
  const notificationKeywords = useLocalStorage<string[]>('chat_notificationKeywords', []);
  const notificationsEnabled = useLocalStorage('chat_notificationsEnabled', false);
  const { isSupported, ensurePermissions, permissionGranted, show } = useWebNotification({
    requestPermissions: false,
  });

  async function toggleNotifications(targetValue: boolean) {
    if (!targetValue) {
      notificationsEnabled.value = false;
      return;
    }

    if (!isSupported) {
      notificationsEnabled.value = false;
      log.warn('Notifications Unsupported');
      return;
    }

    if (permissionGranted.value) {
      notificationsEnabled.value = true;
      return;
    }

    const granted = await ensurePermissions();
    if (granted) {
      notificationsEnabled.value = true;
    } else {
      notificationsEnabled.value = false;
      log.warn('Notification permission denied');
    }
  }

  /** Sends device notification only if granted permission */
  async function sendNotification(
    { title, body, tag }: WebNotificationOptions,
    onClick?: () => void,
  ) {
    if (!notificationsEnabled.value) {
      return;
    }

    try {
      const notification = await show({ title, body, tag });
      if (notification && onClick) {
        notification.addEventListener('click', onClick);
      }
    } catch (error) {
      log.error('Notification error', error);
    }
  }

  return {
    indicatorText,
    notificationKeywords,
    notificationsEnabled: computed(() => notificationsEnabled.value),
    toggleNotifications,
    sendNotification,
  };
});

export default useNotificationsStore;
