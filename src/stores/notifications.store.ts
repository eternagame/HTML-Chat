import { NOTIFICATION_THROTTLE_TIME } from '#constants';
import type { SilenceNotificationEvent } from '#models';
import { sleep } from '#utils';
import {
  useBroadcastChannel,
  useLocalStorage,
  useWebNotification,
  type WebNotificationOptions,
} from '@vueuse/core';
import log from 'loglevel';
import { defineStore } from 'pinia';
import type { SetRequired } from 'type-fest';
import { readonly, watch } from 'vue';

export const useNotificationsStore = defineStore('notifications', () => {
  const keywords = useLocalStorage<Set<string>>('chat_notificationKeywords', new Set<string>());
  const deviceEnabled = useLocalStorage('chat_deviceNotificationsEnabled', false);
  const { isSupported, ensurePermissions, permissionGranted, show } = useWebNotification({
    requestPermissions: false,
  });
  const silenceBroadcast = useBroadcastChannel<SilenceNotificationEvent, SilenceNotificationEvent>({
    name: 'silence-notification',
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

  /**
   * Use LockManager to ensure only 1 tab will perform an action.
   * See https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
   */
  async function throttleLock(key: string, cb?: () => void | Promise<void>) {
    if ('locks' in navigator) {
      await navigator.locks.request(key, { ifAvailable: true }, async (lock) => {
        if (!lock) {
          return;
        }

        await cb?.();
        await sleep(NOTIFICATION_THROTTLE_TIME);
      });
    } else {
      await cb?.();
    }
  }

  /**
   * Claims lock to ignore next notification.
   * Notifies other tabs to do the same.
   */
  function silenceNextNotification(tag: string) {
    throttleLock(tag, () => {
      if (silenceBroadcast.isSupported) {
        silenceBroadcast.post({ key: tag, timestamp: Date.now() });
      }
    });
  }

  watch(silenceBroadcast.data, ({ key }) => {
    // Received message to ignore next notification
    throttleLock(key);
  });

  /** Sends device notification only if granted permission */
  async function sendNotification(
    { title, body, tag }: SetRequired<WebNotificationOptions, 'title' | 'body' | 'tag'>,
    onClick?: () => void,
  ) {
    if (!deviceEnabled.value) {
      return;
    }

    // Give the active tab time to notify that the channel has been read already
    await sleep(100);
    await throttleLock(tag, async () => {
      try {
        const notification = await show({ title, body, tag });
        if (notification && onClick) {
          notification.addEventListener('click', onClick);
        }
      } catch (error) {
        log.error('Notification error', error);
      }
    });
  }

  return {
    keywords: readonly(keywords),
    addKeyword,
    removeKeyword,
    deviceSupported: isSupported,
    deviceEnabled: readonly(deviceEnabled),
    toggleNotifications,
    sendNotification,
    silenceNextNotification,
  };
});
