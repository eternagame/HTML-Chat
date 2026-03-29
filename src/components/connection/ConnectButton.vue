<template>
  <BButton class="w-100" type="button" variant="primary" @click="reconnect">Reconnect</BButton>
</template>
<script setup lang="ts">
  import { useIrcStore } from '#stores';
  import { BButton } from 'bootstrap-vue-next';

  const irc = useIrcStore();
  function reconnect() {
    irc.reconnect();
  }
</script>
