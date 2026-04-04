import { useLocalStorage, useWebNotification, type WebNotificationOptions } from '@vueuse/core';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { readonly } from 'vue';

export const useNotificationsStore = defineStore('notifications', () => {
  const indicatorText = useLocalStorage('chat_indicatorText', '(!)');
  const keywords = useLocalStorage<Set<string>>('chat_notificationKeywords', new Set<string>());
  const deviceEnabled = useLocalStorage('chat_deviceNotificationsEnabled', false);
  const { isSupported, ensurePermissions, permissionGranted, show } = useWebNotification({
    requestPermissions: false,
  });

  function addKeyword(keyword: string) {
    keywords.value.add(keyword.toLocaleLowerCase());
  }

  function removeKeyword(keyword: string) {
    keywords.value.delete(keyword);
  }

  async function toggleNotifications(targetValue: boolean) {
    if (!targetValue) {
      deviceEnabled.value = false;
      return;
    }

    if (!isSupported) {
      deviceEnabled.value = false;
      log.warn('Notifications Unsupported');
      return;
    }

    if (permissionGranted.value) {
      deviceEnabled.value = true;
      return;
    }

    const granted = await ensurePermissions();
    if (granted) {
      deviceEnabled.value = true;
    } else {
      deviceEnabled.value = false;
      log.warn('Notification permission denied');
    }
  }

  /** Sends device notification only if granted permission */
  async function sendNotification(
    { title, body, tag }: WebNotificationOptions,
    onClick?: () => void,
  ) {
    if (!deviceEnabled.value) {
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
    keywords: readonly(keywords),
    addKeyword,
    removeKeyword,
    deviceSupported: isSupported,
    deviceEnabled: readonly(deviceEnabled),
    toggleNotifications,
    sendNotification,
  };
});
