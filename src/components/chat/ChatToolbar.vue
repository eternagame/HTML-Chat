<template>
  <BButtonToolbar key-nav aria-label="Formatting tools" role="toolbar">
    <BButtonGroup size="sm">
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Bold"
        @click="emit('format', 'Bold')"
        ><span class="visually-hidden">Bold</span><strong aria-hidden="true">B</strong></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Underline"
        @click="emit('format', 'Underline')"
        ><span class="visually-hidden">Underline</span><u aria-hidden="true">U</u></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Italics"
        @click="emit('format', 'Italics')"
        ><span class="visually-hidden">Italic</span><i aria-hidden="true">I</i></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Strikethrough"
        @click="emit('format', 'Strikethrough')"
        ><span class="visually-hidden">Strikethrough</span><s aria-hidden="true">S</s></BButton
      >
    </BButtonGroup>
    <BButtonGroup size="sm">
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Blockquote"
        @click="emit('format', 'Blockquote')"
        ><span class="visually-hidden">Quote</span><span aria-hidden="true">""</span></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Code"
        @click="emit('format', 'Code')"
        ><span class="visually-hidden">Code</span><span aria-hidden="true">&lt;/&gt;</span></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Link"
        @click="emit('format', 'Link')"
        ><span class="visually-hidden">Link</span><span aria-hidden="true">🔗</span></BButton
      >
      <BButton
        type="button"
        variant="outline-secondary"
        v-b-popover
        title="Highlight"
        @click="emit('format', 'Highlight')"
        ><span class="visually-hidden">Highlight</span
        ><mark class="highlight" aria-hidden="true">H</mark></BButton
      >
    </BButtonGroup>

    <BButtonGroup size="sm">
      <BButton
        type="button"
        variant="outline-secondary"
        v-for="(emoji, index) in settings.customEmojis"
        :key="index"
        @click="emit('emoticon', emoji)"
        >{{ emoji }}</BButton
      >
    </BButtonGroup>
  </BButtonToolbar>
</template>
<script setup lang="ts">
  import type { MdFormat } from '#models';
  import { useSettingsStore } from '#stores';
  import { BButton, BButtonGroup, BButtonToolbar } from 'bootstrap-vue-next';

  const emit = defineEmits<{
    (event: 'format', type: MdFormat): void;
    (event: 'emoticon', value: string): void;
  }>();

  const settings = useSettingsStore();
</script>
<style scoped>
  .highlight {
    color: black;
    background-color: yellow;
  }
</style>
