<template>
  <div
    class="message-group-meta"
    v-if="groupStartPositions.has(index) && message.type !== 'system' && message.type !== 'notice'"
    ref="root"
  >
    <UsernameDisplay :username="message.username" :nick="message.nick" />

    <BPopover :delay="{ show: 250, hide: 100 }" v-if="visible">
      <template #target>
        <time class="message-timestamp flex-shrink-0">{{ formatTime(message.time) }}</time>
      </template>

      {{ formateDateTime(message.time) }}
    </BPopover>
    <time class="message-timestamp flex-shrink-0" v-else>{{ formatTime(message.time) }}</time>
  </div>
  <ChannelMessage
    :message="message"
    :is-ignored="userList.ignoredUsernames.has(message.username)"
  />
</template>

<script setup lang="ts">
  import { formatTime, formateDateTime } from '#utils';
  import { useElementVisibility } from '@vueuse/core';
  import { useTemplateRef } from 'vue';
  import { BPopover } from 'bootstrap-vue-next';
  import UsernameDisplay from '#components/user/UsernameDisplay.vue';
  import ChannelMessage from './ChannelMessage.vue';

  const props = defineProps<{
    message: any;
    userList: any;
    groupStartPositions: any;
    index: number;
  }>();

  const root = useTemplateRef('root');
  const visible = useElementVisibility(root);
</script>

<style scoped>
  .message-group-meta {
    display: flex;
    justify-content: space-between;
    margin-block: 2px;
  }

  .message-group-meta,
  .message-container {
    padding-inline: 1em;
  }
</style>
