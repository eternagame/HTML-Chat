<template>
  <div class="chat-input-container">
    <div class="chat-input-features">
      <MessageContent
        v-if="inputBuffer.trim().length > 0 && !inputBuffer.startsWith('/')"
        :content="inputBuffer"
      />
    </div>

    <BForm @submit.prevent="onSubmit">
      <BInputGroup size="lg">
        <BFormInput
          v-model="inputBuffer"
          autocomplete="off"
          :placeholder="placeholder"
          aria-label="Chat message"
        />
        <BButton type="submit" variant="primary" class="px-4" :disabled="!inputBuffer.trim()"
          >Send</BButton
        >
      </BInputGroup>
    </BForm>
  </div>
</template>

<script setup lang="ts">
  import MessageContent from '#components/message/MessageContent.vue';
  import { useChannelStore, useChatStore } from '#stores';
  import { BButton, BForm, BFormInput, BInputGroup } from 'bootstrap-vue-next';
  import { computed, ref } from 'vue';

  const channel = useChannelStore();
  const chat = useChatStore();
  const inputBuffer = ref('');
  const placeholder = computed(() => `Message ${channel.currentChannel?.displayName ?? ''}`);

  function onSubmit() {
    const text = inputBuffer.value.trim();
    if (!text) {
      return;
    }
    chat.handleUserInput(inputBuffer.value);
    inputBuffer.value = '';
  }
</script>

<style scoped>
  .chat-input-features:not(:empty) {
    border-top: 1px dashed currentColor;
    padding: 0.25em 1em;
  }
</style>
