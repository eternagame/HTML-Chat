<template>
  <BButton
    class="w-100"
    type="button"
    variant="primary"
    @click="reconnect"
    :loading="tryingToConnect"
    loading-text="Connecting..."
    >Reconnect</BButton
  >
</template>
<script setup lang="ts">
  import { useIrcStore } from '#stores';
  import { BButton } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const irc = useIrcStore();
  const tryingToConnect = computed(() => irc.connectionStatus === 'connecting');
  function reconnect() {
    irc.reconnect();
  }
</script>
