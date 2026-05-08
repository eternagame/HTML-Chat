<template>
  <div class="chat-input-container">
    <div v-if="inputBuffer.trim().length > 0 && !inputBuffer.startsWith('/')" class="chat-preview">
      <small class="text-muted d-block">Preview</small>
      <MessageContent class="chat-preview-content" :content="inputBuffer" inert />
    </div>

    <BForm @submit.prevent="onSubmit">
      <ChatToolbar :aria-controls="inputId" @format="onFormat" />
      <BFormGroup label="Chat message" label-visually-hidden>
        <BInputGroup size="lg">
          <BFormInput
            :id="inputId"
            ref="chat-input"
            v-model="inputBuffer"
            autocomplete="off"
            :placeholder="placeholder"
            @keydown="onKeydown"
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
  import { computed, nextTick, ref, useId, useTemplateRef } from 'vue';
  import ChatToolbar from './ChatToolbar.vue';
  import type { MdFormat } from '#models';
  import { toggleMDFormat } from '#utils/md-format.util.ts';

  const channel = useChannelStore();
  const chat = useChatStore();

  const inputId = useId();
  const inputRef = useTemplateRef('chat-input');
  const inputBuffer = ref('');
  const placeholder = computed(() => `Message ${channel.currentChannel?.displayName ?? ''}`);

  function onFormat(format: MdFormat) {
    if (!inputRef.value?.element) {
      return;
    }
    const input = inputRef.value.element;
    const { selectionDirection, selectionStart, selectionEnd } = input;
    const start = typeof selectionStart === 'number' ? selectionStart : inputBuffer.value.length;
    const end = typeof selectionEnd === 'number' ? selectionEnd : start;
    const output = toggleMDFormat({
      text: inputBuffer.value,
      selectionRange: [start, end],
      format,
    });
    inputBuffer.value = output.text;
    nextTick(() => {
      input.focus();
      input.setSelectionRange(
        output.selectionRange[0],
        output.selectionRange[1],
        selectionDirection ?? undefined,
      );
    });
  }

  function onKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    switch (event.key.toLocaleLowerCase()) {
      case 'b':
        event.preventDefault();
        onFormat('Bold');
        break;
      case 'u':
        event.preventDefault();
        onFormat('Underline');
        break;
      case 'i':
        event.preventDefault();
        onFormat('Italics');
        break;
      case 'k':
        event.preventDefault();
        onFormat('Link');
        break;
    }
  }

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
