import type { ConfirmationModalData } from '#models';
import { defineStore } from 'pinia';
import type { SetRequired } from 'type-fest';
import { readonly, ref, shallowRef } from 'vue';

export const useConfirmationStore = defineStore('confirmation', () => {
  const isOpen = ref(false);
  const data = ref<ConfirmationModalData | null>(null);
  const confirmCb = shallowRef<(() => void) | null>(null);
  const cancelCb = shallowRef<(() => void) | null>(null);

  function prompt(
    modalData: SetRequired<Partial<ConfirmationModalData>, 'title'>,
    onConfirm: () => void,
    onCancel: (() => void) | null = null,
  ) {
    data.value = {
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      ...modalData,
    };
    confirmCb.value = onConfirm;
    cancelCb.value = onCancel;
    isOpen.value = true;
  }

  function cleanup() {
    isOpen.value = false;
    data.value = null;
    confirmCb.value = null;
    cancelCb.value = null;
  }

  function confirm() {
    confirmCb.value?.();
    cleanup();
  }

  function cancel() {
    cancelCb.value?.();
    cleanup();
  }

  return {
    isOpen: readonly(isOpen),
    data: readonly(data),
    prompt,
    confirm,
    cancel,
  };
});
