<template>
  <li
    @mouseover="hover = true"
    @focusin="hover = true"
    @mouseleave="hover = false"
    @focusout="hover = true"
  >
    <Username :user="user" />
    <ItemOptions :user="user" :hover="hover" />
  </li>
</template>
<script lang="ts" setup>
import User from '@/types/user';
import Username from '@/components/Messages/Username.vue';
import ItemOptions from '@/components/ItemOptions.vue';
import { ref } from 'vue';

defineProps({
  user: {
    type: User,
    required: true,
  },
});
const hover = ref(false);
</script>
<style scoped>
  li {
    position:relative;
    top:0;
    left:0;
  }
</style>
