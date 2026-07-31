<template>
  <button ref="display-name" type="button" class="username" :style="{ color: usernameColor }">
    {{ user.displayName }}
    <StatusIndicator v-if="user.status !== 'online'" :status="user.status" class="status" />
  </button>
  &nbsp;<PlayerTooltip :username="username" :target="tooltipTarget" v-if="visible" />
</template>

<script setup lang="ts">
  import PlayerTooltip from '#components/tooltips/PlayerTooltip.vue';
  import StatusIndicator from '#components/ui/StatusIndicator.vue';
  import { LOADING_USER } from '#constants';
  import { useUserListStore } from '#stores';
  import { useElementVisibility } from '@vueuse/core';
  import { computed, useTemplateRef } from 'vue';

  const props = defineProps<{ username: string; nick?: string }>();
  const userList = useUserListStore();
  const user = computed(
    () => userList.getUserByUsername(props.username, props.nick) ?? LOADING_USER,
  );
  const usernameColor = computed(() => user.value.color);
  const tooltipTarget = useTemplateRef('display-name');
  const visible = useElementVisibility(tooltipTarget);
</script>

<style scoped>
  .username {
    display: inline-block;
    background-color: transparent;
    padding: 0;
    font-family: inherit;
    outline-color: currentColor;
    border: 0;
    font-size: 15px;
  }
</style>
