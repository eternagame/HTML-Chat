<template>
  <SettingsGroup title="Font Size">
    <BFormGroup label="Font Size" label-visually-hidden description="Font size range: 10px - 18px">
      <BFormInput
        type="range"
        :min="FONT_SIZE_MIN"
        :max="FONT_SIZE_MAX"
        :model-value="settings.fontSize"
        step="1"
        @update:model-value="updateFontSize"
      />
    </BFormGroup>
  </SettingsGroup>
</template>

<script setup lang="ts">
  import { BFormGroup, BFormInput } from 'bootstrap-vue-next';
  import SettingsGroup from './ui/SettingsGroup.vue';
  import { FONT_SIZE_MAX, FONT_SIZE_MIN } from '#constants';
  import { useSettingsStore } from '#stores';

  const settings = useSettingsStore();
  function updateFontSize(event: string | number | null) {
    if (!event) {
      return;
    }

    const value = typeof event === 'number' ? event : Number.parseInt(event, 10);

    if (!Number.isNaN(value)) {
      settings.setFontSize(value);
    }
  }
</script>
