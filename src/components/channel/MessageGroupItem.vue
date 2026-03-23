<template>
  <div
    v-if="message.type === 'system'"
    class="message-container d-flex flex-row flex-nowrap justify-content-center"
  >
    <p class="message-content m-0 message-type--system">
      {{ props.message.message }}
    </p>
  </div>
  <div v-else class="message-container d-flex flex-row flex-nowrap">
    <div
      class="message-content flex-grow-1"
      :class="{
        'message-status--error': message.status === 'error',
        'message-status--pending': message.status === 'pending',
        'message-status--sent': message.status === 'sent',
        'message-type--action': message.type === 'action',
        'message-type--notice': message.type === 'notice',
        'message-type--privmsg': message.type === 'privmsg',
      }"
      v-html="formattedMessage"
    />

    <time v-if="message.type !== 'notice'" class="message-timestamp flex-shrink-0"
      >[{{ formatTime(message.time) }}]</time
    >
  </div>
</template>

<script setup lang="ts">
  import type { Message } from '#models';
  import { formatTime, md } from '#utils';
  import { computed } from 'vue';

  const props = defineProps<{ message: Message }>();
  const formattedMessage = computed(() => {
    if (props.message.type !== 'system') {
      // TODO: Add event handlers via event delegation
      return md.renderInline(props.message.message);
    }
    return '';
  });
</script>

<style scoped lang="scss">
  @import '#styles/_variables.scss';

  .message-container {
    gap: 1em;
  }

  .message-status--pending {
    opacity: 0.5;
  }
  .message-type--action {
    font-style: italic;
  }
  .message-type--notice,
  .message-type--system {
    font-style: italic;
  }
  .message-type--notice {
    text-align: center;
    &::before,
    &::after {
      content: ' * ';
    }
  }

  :deep(.message-content) {
    word-break: break-all;

    .screenshot {
      object-fit: contain;
      max-width: 500px;
      width: 100%;
    }
    .cursive {
      font-family: cursive;
    }
    .serif {
      font-family: serif;
    }
    .highlight {
      background-color: yellow;
      color: black;
    }
    blockquote {
      display: inline;
      border-left: 5px solid gray;
      padding-left: 0.125em;
      quotes: '“' '”' '‘' '’';
    }
    blockquote:before {
      margin-left: 2px;
      content: open-quote;
    }
    blockquote:after {
      content: close-quote;
    }
    mark {
      background-color: darken($dark-blue, 5%) !important;
      color: #c0dce7;
    }
    mark:hover {
      color: white;
      cursor: pointer;
    }
  }

  .message-timestamp {
    font-size: 0.8em;
  }
</style>
