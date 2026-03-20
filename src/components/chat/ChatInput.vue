<template>
  <div class="chat-input-container p3 border-top bg-light">
    <BForm @submit.prevent="onSubmit">
      <BInputGroup size="lg">
        <BFormInput
          v-model="inputBuffer"
          autofocus
          autocomplete="off"
          :placeholder="placeholder"
          aria-label="Chat message"
        />
        <BButton
          type="submit"
          variant="primary"
          class="px-4"
          :disabled="!inputBuffer.trim()"
        ></BButton>
      </BInputGroup>
    </BForm>
  </div>
</template>

<script setup lang="ts">
  import { useChannelStore, useChatStore } from '#stores';
  import { BButton, BForm, BFormInput, BInputGroup } from 'bootstrap-vue-next';
  import { computed, ref } from 'vue';

  const channel = useChannelStore();
  const chat = useChatStore();
  const inputBuffer = ref('');
  const placeholder = computed(() => `Message ${channel.activeChannelName}`);

  function onSubmit() {
    const text = inputBuffer.value.trim();
    if (!text) {
      return;
    }

    const isCommand = text.startsWith('/');

    if (isCommand) {
      // TODO: Add command handler
    } else {
      chat.say(text);
    }

    inputBuffer.value = '';
  }
</script>

<style scoped>
  .chat-input-container {
    min-height: 5em;
  }
</style>
