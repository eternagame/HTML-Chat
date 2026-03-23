<template>
  <div class="message-group-container">
    <UsernameDisplay
      v-if="messageGroup.type !== 'system' && messageGroup.type !== 'notice'"
      :username="messageGroup.username"
    />
    <div class="message-group d-flex flex-column">
      <MessageGroupItem
        v-for="message in messageGroup.messages"
        :key="message.id"
        :message="message"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import type { MessageGroup } from '#composables/useMessageGroups.ts';
  import MessageGroupItem from './MessageGroupItem.vue';
  defineProps<{ messageGroup: MessageGroup }>();
</script>

<style scoped></style>
