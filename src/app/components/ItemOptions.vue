<template>
  <div style="overflow:hidden">
    <button
      type="button"
      class="chat-message-options border-0 text-white font-weight-bold"
      ref="chatOptions"
      aria-label="Open message options"
      @click.prevent="openContextMenu"
      v-show="hovered && user.username"
      @blur="hovered = false"
      @keypress.enter.prevent="openContextMenuWithKey"
    >
      &vellip; <!-- ⋮ -->
    </button>
    <ActionMenu
      ref="contextMenu"
      :message="msg"
    />
  </div>
</template>
<script lang="ts" setup>
import ActionMenu from '@/components/Messages/ActionMenu.vue';
import Message from '@/types/message';
import User from '@/types/user';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  user: User;
  message?: Message;
  hover: boolean;
}>();

const contextMenu = ref<ActionMenu>();
const chatOptions = ref<HTMLButtonElement>();
const hovered = ref<boolean>(false);
watch(() => props.hover, (hover => {
  hovered.value = hover;
}));

const msg = computed(() => props.message ?? new Message('Reporting user', '*', props.user));

function openContextMenu(e: MouseEvent) {
  setTimeout(() => {
    // @ts-expect-error TODO: Fix type for Composition API
    contextMenu.value?.open(e);
  });
}

function openContextMenuWithKey(e: KeyboardEvent) {
  const rect = (e.target as Element).getBoundingClientRect();
  const event = new MouseEvent('click', {
    clientX: rect.x,
    clientY: rect.y,
  });
  setTimeout(() => {
    // @ts-expect-error TODO: Fix type for Composition API
    contextMenu.value?.open(event);
  });
}
</script>
<style scoped>
  .chat-message-options {
    position: absolute;
    top: -4px;
    right: 5px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    background-color: transparent;
  }
  .chat-message-options:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
