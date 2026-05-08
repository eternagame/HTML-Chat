<template>
  <template v-if="isAttemptingConnection">
    <BAlert class="m-0" v-if="irc.connectionStatus === 'connecting'" :model-value="true">
      <BSpinner class="loading-icon mr-1" />
      <template v-if="irc.reconnectionStatus.isReconnecting">
        <span
          >(Attempt {{ irc.reconnectionStatus.retryCount }} of
          {{ irc.reconnectionStatus.maxRetryCount }})</span
        >
        Reconnecting...
        <BProgress
          variant="warning"
          :value="irc.reconnectionStatus.retryDelay / 1_000 - irc.reconnectionCountdown"
          :max="irc.reconnectionStatus.retryDelay / 1_000"
          height="4px"
        ></BProgress>
      </template>
      <template v-else> Connecting... </template>
    </BAlert>
    <BAlert
      class="m-0"
      v-else-if="irc.connectionStatus === 'reconnect failed'"
      :model-value="true"
      variant="danger"
    >
      Failed to reconnect.
    </BAlert>
  </template>

  <ConnectButton v-if="irc.connectionStatus !== 'connected'" class="connect-button" />
</template>

<script setup lang="ts">
  import { useIrcStore } from '#stores';
  import { BAlert, BProgress, BSpinner } from 'bootstrap-vue-next';
  import { computed } from 'vue';
  import ConnectButton from './ConnectButton.vue';

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

  .connect-button {
    margin: 0.75em 0;
  }
</style>
