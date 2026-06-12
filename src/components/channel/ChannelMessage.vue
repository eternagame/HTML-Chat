<template>
  <div class="message-container" :class="{ 'message-container--ignored': isIgnored }">
    <div v-if="isIgnored" class="flex-grow-1 ignored-placeholder">
      Message hidden from ignored user.
    </div>
    <MessageContent
      v-else
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
      <BDropdown class="message-options" variant="link" no-caret>
        <template #button-content>&#8942;</template>
        <BDropdownItem @click="onReport"><span aria-hidden="true">🚩</span> Report</BDropdownItem>
        <BDropdownItem @click="toggleIgnore"
          ><span aria-hidden="true">🔇</span> Ignore/Unignore User</BDropdownItem
        >
      </BDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import MessageContent from '#components/message/MessageContent.vue';
  import type { Message } from '#models';
  import { useReportStore, useUserListStore } from '#stores';
  import { BDropdown, BDropdownItem } from 'bootstrap-vue-next';

  const report = useReportStore();
  const userList = useUserListStore();
  const props = defineProps<{ message: Message; isIgnored?: boolean }>();

  function onReport() {
    const user = userList.getUserByUsername(props.message.username);
    report.startReport(user ?? { username: props.message.username, uid: 'n/a' }, props.message);
  }
  function toggleIgnore() {
    if (userList.ignoredUsernames.has(props.message.username)) {
      userList.unignoreUser(props.message.username);
    } else {
      userList.ignoreUser(props.message.username);
    }
  }
</script>

<style scoped>
  .message-container {
    gap: 1em;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  .message-container--ignored {
    .ignored-placeholder {
      color: var(--bs-secondary);
      font-style: italic;
      font-size: 0.9em;
      user-select: none;
    }

    .message-timestamp {
      opacity: 0.4;
    }
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
    margin-right: -12px;

    :deep(.btn-link) {
      padding: 0;
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
