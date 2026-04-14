<template>
  <div class="message-group-item-container">
    <MessageContent
      class="flex-grow-1"
      :class="{
        'message-status--error': message.status === 'error',
        'message-status--pending': message.status === 'pending',
        'message-status--sent': message.status === 'sent',
        'message-type--action': message.type === 'action',
        'message-type--notice': message.type === 'notice',
        'message-type--privmsg': message.type === 'privmsg',
        'message-type--system': message.type === 'system',
      }"
      :content="message.message"
    />

    <div v-if="message.type !== 'system'" class="message-extras">
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
  import MessageContent from '#components/message/MessageContent.vue';
  import type { Message } from '#models';
  import { useReportStore, useUserListStore } from '#stores';
  import { formateDateTime, formatTime } from '#utils';
  import { BDropdown, BDropdownItem, BPopover } from 'bootstrap-vue-next';

  const report = useReportStore();
  const userList = useUserListStore();
  const props = defineProps<{ message: Message }>();

  function onReport() {
    const user = userList.getUserByUsername(props.message.username);
    report.startReport(user ?? { username: props.message.username, uid: 'n/a' }, props.message);
  }
</script>

<style scoped>
  .message-group-item-container {
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
    text-align: center;
  }
  .message-type--notice {
    &::before,
    &::after {
      content: ' * ';
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
  .message-group-item-container:hover,
  .message-group-item-container:focus-within {
    .message-options {
      opacity: 1;

      @media (prefers-reduced-motion: no-preference) {
        transition: opacity 250ms ease-in;
      }
    }
  }
</style>
