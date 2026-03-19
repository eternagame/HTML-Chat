<template>
  <time>[{{ formatTime(message.time) }}]</time>
  <p>{{ formattedMessage }}</p>
</template>

<script setup lang="ts">
  import type { Message } from '#models';
  import { formatTime } from '#utils';
  import { computed } from 'vue';

  const props = defineProps<{ message: Message }>();
  // TODO: Use markdown parser for `privmsg` entries
  const formattedMessage = computed(() => props.message.message);
</script>

<style scoped></style>
