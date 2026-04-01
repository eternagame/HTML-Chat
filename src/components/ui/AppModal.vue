<template>
  <div v-if="modelValue" class="app-modal-overlay" role="presentation" @click.self="onClose">
    <div ref="modal" class="app-modal" role="dialog" aria-modal>
      <header class="app-modal-header">
        <h3 class="m-0">{{ title }}</h3>
      </header>

      <div class="app-modal-body">
        <slot />
      </div>

      <div class="app-modal-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTemplateRef, watch } from 'vue';
  import { onKeyDown } from '@vueuse/core';
  import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

  const props = defineProps<{ title: string; modelValue: boolean }>();
  const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void;
  }>();

  const modalRef = useTemplateRef('modal');

  function onClose() {
    emit('update:modelValue', false);
  }

  // Dismiss on escape
  onKeyDown('Escape', (event) => {
    if (props.modelValue) {
      event.preventDefault();
      onClose();
    }
  });

  const { activate, deactivate } = useFocusTrap(modalRef, {
    immediate: false,
    allowOutsideClick: true,
    escapeDeactivates: false,
  });

  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen) {
        activate();
      } else {
        deactivate();
      }
    },
  );
</script>

<style scoped>
  .app-modal-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    isolation: isolate;
  }

  .app-modal {
    width: 90%;
    max-width: 400px;
    min-width: fit-content;
    background-color: #05224b;
    padding: 0.75em 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .app-modal-body {
    overflow-y: auto;
  }

  .app-modal-footer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
    justify-content: end;
  }
</style>
