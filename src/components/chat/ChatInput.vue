<template>
  <div class="chat-input-container">
    <div
      v-if="inputBuffer.trim().length > 0 && !inputBuffer.startsWith('/') && previreActive"
      class="chat-preview"
    >
      <small class="text-muted d-block">Preview</small>
      <MessageContent class="chat-preview-content" :content="inputBuffer" inert />
    </div>

    <BForm @submit.prevent="onSubmit">
      <ChatToolbar
        :aria-controls="inputId"
        @format="onFormat"
        v-model:preview-active="previreActive"
        class="toolbar"
        v-show="toolbarVisible"
      />
      <BFormGroup label="Chat message" label-visually-hidden>
        <BInputGroup>
          <BFormTextarea
            :id="inputId"
            ref="chat-input"
            v-model="inputBuffer"
            autocomplete="off"
            :placeholder="placeholder"
            @keydown="onKeydown"
            :formatter="(val: string) => val.replaceAll(/\s*\n\s*/g, ' ')"
            :disabled="irc.currentUser.uid === ANONYMOUS_USER.uid"
            border-variant="transparent"
            rows="1"
            max-rows="6"
          />
          <BButton
            type="submit"
            class="format-button"
            v-b-popover.child
            title="Format"
            aria-label="Format"
            @click="toolbarVisible = !toolbarVisible"
            >A</BButton
          >
          <BButton type="submit" variant="primary" class="px-2" :disabled="!inputBuffer.trim()"
            >Send</BButton
          >
        </BInputGroup>
      </BFormGroup>
    </BForm>
  </div>
</template>

<script setup lang="ts">
  import MessageContent from '#components/message/MessageContent.vue';
  import { useChannelStore, useChatStore, useIrcStore } from '#stores';
  import {
    BButton,
    BForm,
    BFormGroup,
    BFormTextarea,
    BInputGroup,
    vBPopover,
  } from 'bootstrap-vue-next';
  import { computed, nextTick, ref, useId, useTemplateRef } from 'vue';
  import ChatToolbar from './ChatToolbar.vue';
  import type { MdFormat } from '#models';
  import { toggleMDFormat } from '#utils/md-format.util.ts';
  import { ANONYMOUS_USER } from '#constants';

  const channel = useChannelStore();
  const chat = useChatStore();
  const irc = useIrcStore();

  const inputId = useId();
  const inputRef = useTemplateRef('chat-input');
  const inputBuffer = ref('');
  const placeholder = computed(() => `Message ${channel.currentChannel?.displayName ?? ''}`);
  const toolbarVisible = ref(false);
  const previreActive = ref(false);

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
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
      return;
    }

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
    padding-bottom: 0.75em;
    max-height: 10em;
    overflow-y: auto;
  }

  .toolbar {
    margin-bottom: 6px;
  }

  .format-button {
    text-decoration: underline;
    background-color: var(--bs-body-bg);
    border-inline: none;
    border-block-color: var(--bs-border-color);
  }

  .format-button:hover,
  .format-button.btn:active {
    background-color: var(--bs-blue);
    border-block-color: var(--bs-border-color);
  }
</style>
