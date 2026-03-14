<template>
  <button
    type="button"
    :class="{ active: tryingToConnect }"
    class="connect-button btn btn-primary w-100 font-weight-bolder"
    style="font-size:13px;"
    @click="connect"
  >
    Reconnect
  </button>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed } from 'vue';

const tryingToConnect = computed(() => vxm.chat.connectionData.tryingToConnect);

function connect() {
  vxm.chat.connect();
}
</script>
