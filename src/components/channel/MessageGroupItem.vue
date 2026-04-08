<template>
  <div v-if="message.type === 'system'" class="message-container justify-content-center">
    <div class="message-content message-type--system" v-html="formattedMessage" />
  </div>
  <div v-else class="message-container">
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

    <div class="message-extras">
      <BPopover :delay="{ show: 250, hide: 100 }">
        <template #target>
          <time v-if="message.type !== 'notice'" class="message-timestamp flex-shrink-0"
            >[{{ formatTime(message.time) }}]</time
          >
        </template>

        {{ formateDateTime(message.time) }}
      </BPopover>

      <BDropdown class="message-options" variant="link" no-caret>
        <template #button-content>&#8942;</template>
        <BDropdownItem @click="onReport">🚩 Report</BDropdownItem>
      </BDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Message } from '#models';
  import { useReportStore, useUserListStore } from '#stores';
  import { formateDateTime, formatTime, md } from '#utils';
  import { BDropdown, BPopover, BDropdownItem } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const report = useReportStore();
  const userList = useUserListStore();
  const props = defineProps<{ message: Message }>();
  // TODO: Add event handlers via event delegation
  const formattedMessage = computed(() => md.renderInline(props.message.message));

  function onReport() {
    const user = userList.getUserByUsername(props.message.username);
    report.startReport(user ?? { username: props.message.username, uid: 'n/a' }, props.message);
  }
</script>

<style scoped lang="scss">
  @import '#styles/_variables.scss';

  .message-container {
    gap: 1em;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
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
    word-break: break-word;

    .link {
      &:empty {
        display: none;
      }

      &.link--image {
        display: inline-block;
      }
      &.link--external {
        &::after {
          font-size: 0.8em;
          position: relative;
          top: -0.25em;
          content: ' ↗';
          text-decoration: none;
        }
      }
    }

    .screenshot {
      object-fit: contain;
      max-width: 500px;
      width: 100%;
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
      &::before {
        margin-left: 2px;
        content: open-quote;
      }
      &::after {
        content: close-quote;
      }
    }

    .tag {
      background-color: darken($dark-blue, 5%) !important;
      border: none;
      font: inherit;
      outline-color: currentColor;
      color: inherit;
      padding: 0;
      &:hover,
      &:focus {
        color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
      }
    }
  }

  .message-extras {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.25em;
    flex: 0 0 auto;
    align-items: baseline;
  }

  .message-timestamp {
    font-size: 0.8em;
  }

  .message-options {
    flex-grow: 0;
    flex-shrink: 0;
    opacity: 0;

    :deep(.btn-link) {
      padding: 0 0.25em;
      text-decoration: none;
      font-size: inherit;
      line-height: inherit;
    }
  }
  .message-container:hover,
  .message-container:focus-within {
    .message-options {
      opacity: 1;

      @media (prefers-reduced-motion: no-preference) {
        transition: opacity 250ms ease-in;
      }
    }
  }
</style>
