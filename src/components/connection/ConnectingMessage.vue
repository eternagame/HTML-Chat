<template>
  <div v-if="isAttemptingConnection">
    <BAlert v-if="irc.connectionStatus === 'connecting'" :model-value="true">
      <img
        src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
        class="loading-icon mr-auto ml-auto align-middle mb-1"
        alt=""
      />
      Connecting...
    </BAlert>
    <BAlert v-else-if="irc.reconnectionStatus.isReconnecting" :model-value="true" variant="warning">
      <p>Connection failed. Retrying in {{ irc.reconnectionCountdown }} seconds...</p>
      <BProgress
        variant="warning"
        :value="irc.reconnectionCountdown"
        :max="irc.reconnectionStatus.retryDelay / 1_000"
        height="4px"
      ></BProgress>
    </BAlert>
    <BAlert
      v-else-if="irc.connectionStatus === 'reconnect failed'"
      :model-value="true"
      variant="danger"
    >
      Failed to reconnect.
    </BAlert>
  </div>
</template>

<script setup lang="ts">
  import { useIrcStore } from '#stores';
  import { BAlert, BProgress } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const irc = useIrcStore();

  const isAttemptingConnection = computed(
    () =>
      irc.connectionStatus === 'connecting' ||
      irc.connectionStatus === 'reconnect failed' ||
      irc.reconnectionStatus.isReconnecting,
  );
</script>

<style scoped>
  .loading-icon {
    width: 20px;
    height: 20px;
  }
</style>
