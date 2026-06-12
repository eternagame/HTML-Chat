<template>
  <BButtonToolbar key-nav aria-label="Formatting tools" role="toolbar" class="toolbar">
    <BButtonGroup size="sm">
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Bold"
        aria-label="Bold"
        @click="emit('format', 'Bold')"
        ><strong aria-hidden="true">B</strong></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Underline"
        aria-label="Underline"
        @click="emit('format', 'Underline')"
        ><u aria-hidden="true">U</u></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Italics"
        aria-label="Italics"
        @click="emit('format', 'Italics')"
        ><i aria-hidden="true">I</i></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Strikethrough"
        aria-label="Strikethrough"
        @click="emit('format', 'Strikethrough')"
        ><s aria-hidden="true">S</s></BButton
      >
    </BButtonGroup>
    <BButtonGroup size="sm">
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Blockquote"
        aria-label="Blockquote"
        @click="emit('format', 'Blockquote')"
        ><span aria-hidden="true">""</span></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Code"
        aria-label="Code"
        @click="emit('format', 'Code')"
        ><span aria-hidden="true">&lt;/&gt;</span></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover.child
        title="Link"
        @click="emit('format', 'Link')"
        ><span class="visually-hidden">Link</span><span aria-hidden="true">🔗</span></BButton
      >
    </BButtonGroup>
    <BButtonGroup size="sm">
      <BButton
        type="button"
        :variant="previewActive ? 'secondary' : 'outline-secondary'"
        v-b-popover.child
        @click="previewActive = !previewActive"
        >Preview</BButton
      >
    </BButtonGroup>
  </BButtonToolbar>
</template>
<script setup lang="ts">
  import type { MdFormat } from '#models';
  import { BButton, BButtonGroup, BButtonToolbar, vBPopover } from 'bootstrap-vue-next';

  const previewActive = defineModel('previewActive');

  const emit = defineEmits<{
    (event: 'format', type: MdFormat): void;
  }>();
</script>
<style scoped>
  .toolbar {
    display: flex;
    gap: 6px;
  }

  .highlight {
    color: black;
    background-color: yellow;
  }
</style>
