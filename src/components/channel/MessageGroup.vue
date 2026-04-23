<template>
  <div class="message-group-container">
    <UsernameDisplay v-if="showUsername" :username="messageGroup.username" />
    <div class="message-group" :class="{ 'message-group--ignored': isIgnored }">
      <MessageGroupItem
        v-for="message in messageGroup.messages"
        :key="message.id"
        :message="message"
        :is-ignored="isIgnored"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import type { MessageGroup } from '#composables/useMessageGroups.ts';
  import { useUserListStore } from '#stores';
  import { computed } from 'vue';
  import MessageGroupItem from './MessageGroupItem.vue';
  const props = defineProps<{ messageGroup: MessageGroup }>();

  const userList = useUserListStore();
  const showUsername = computed(
    () => props.messageGroup.type !== 'system' && props.messageGroup.type !== 'notice',
  );
  const isIgnored = computed(
    () =>
      props.messageGroup.type !== 'system' &&
      userList.ignoredUsernames.has(props.messageGroup.username),
  );
</script>

<style scoped>
  .message-group {
    display: flex;
    flex-direction: column;
  }
</style>
