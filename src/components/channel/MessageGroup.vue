<template>
  <UsernameDisplay :nick="messageGroup.nick" />
  <MessageGroupItem v-for="message in messageGroup.messages" :key="message.id" :message="message" />
</template>

<script setup lang="ts">
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import type { MessageGroup } from '#composables/useMessageGroups.ts';
  import MessageGroupItem from './MessageGroupItem.vue';
  defineProps<{ messageGroup: MessageGroup }>();
</script>

<style scoped></style>
