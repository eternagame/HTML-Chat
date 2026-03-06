import { useLocalStorage, useWebNotification } from '@vueuse/core';
import { useToast } from 'bootstrap-vue-next';
import { defineStore } from 'pinia';
import { computed } from 'vue';

const useNotificationsStore = defineStore('notifications', () => {
  const toast = useToast();

  const indicatorText = useLocalStorage('chat_indicatorText', '(!)');
  const notificationKeywords = useLocalStorage<string[]>('chat_notificationKeywords', []);
  const notificationsEnabled = useLocalStorage('chat_notificationsEnabled', false);
  const { isSupported, ensurePermissions, permissionGranted } = useWebNotification({
    requestPermissions: false,
  });

  async function toggleNotifications(targetValue: boolean) {
    if (!targetValue) {
      notificationsEnabled.value = false;
      return;
    }

    if (!isSupported) {
      notificationsEnabled.value = false;
      toast.show({
        title: 'Notifications Unsupported',
        body: 'Your browser does not support notifications.',
        variant: 'warning',
        position: 'bottom-center',
      });
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
      toast.show({
        title: 'Permission Denied',
        body: 'Browser notifications are blocked.',
        variant: 'warning',
        position: 'bottom-center',
      });
    }
  }

  return {
    indicatorText,
    notificationKeywords,
    notificationsEnabled: computed(() => notificationsEnabled.value),
    toggleNotifications,
  };
});

export default useNotificationsStore;
