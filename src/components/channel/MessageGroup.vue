<template>
  <UsernameDisplay v-if="messageGroup.type !== 'system'" :username="messageGroup.username" />
  <div class="messages d-flex flex-column">
    <MessageGroupItem
      v-for="message in messageGroup.messages"
      :key="message.id"
      :message="message"
    />
  </div>
</template>

<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import type { MessageGroup } from '#composables/useMessageGroups.ts';
  import MessageGroupItem from './MessageGroupItem.vue';
  defineProps<{ messageGroup: MessageGroup }>();
</script>

<style scoped>
  .messages {
    gap: 0.25em;
  }
</style>
