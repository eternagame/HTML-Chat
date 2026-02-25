<template>
  <button type="button" lass="btn unread-banner-container rounded w-100 p-1 btn-primary">
    {{messages}} new message{{messages === 1 ? 's' : ''}}
  </button>
</template>
<script lang="ts" setup>
defineProps({
  messages: {
    type: Number,
    required: true,
  },
});
</script>
<style scoped lang="scss">
.unread-banner-container {
  position:sticky;
  bottom:0;
}
</style>
