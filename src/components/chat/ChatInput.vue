<template>
  <div class="chat-input-container">
    <div v-if="inputBuffer.trim().length > 0 && !inputBuffer.startsWith('/')" class="chat-preview">
      <small class="text-muted d-block">Preview</small>
      <MessageContent class="chat-preview-content" :content="inputBuffer" inert />
    </div>

    <BForm @submit.prevent="onSubmit">
      <BFormGroup label="Chat message" label-visually-hidden>
        <BInputGroup size="lg">
          <BFormInput
            :id="inputId"
            v-model="inputBuffer"
            autocomplete="off"
            :placeholder="placeholder"
          />
          <BButton type="submit" variant="primary" class="px-4" :disabled="!inputBuffer.trim()"
            >Send</BButton
          >
        </BInputGroup>
      </BFormGroup>
    </BForm>
  </div>
</template>

<script setup lang="ts">
  import MessageContent from '#components/message/MessageContent.vue';
  import { useChannelStore, useChatStore } from '#stores';
  import { BButton, BForm, BFormGroup, BFormInput, BInputGroup } from 'bootstrap-vue-next';
  import { computed, ref, useId } from 'vue';

  const channel = useChannelStore();
  const chat = useChatStore();

  const inputId = useId();
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
  .chat-preview {
    border-top: 1px dashed currentColor;
    padding: 0.25em 1em;
    max-height: 10em;
    overflow-y: auto;
  }
</style>
