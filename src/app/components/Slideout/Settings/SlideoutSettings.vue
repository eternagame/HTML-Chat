<template>
  <div
    class="settings-wrapper pt-1 pb-1 pr-1 pl-3 overflow-auto"
    :style="{ fontSize: `${fontSize}px` }">
    <TextSizeSection />
    <IgnoredSection />
    <NotificationsSection />
    <UsernameColorSection />
    <ToolbarSection />
    <StatusSection />
    <OperSection @auth="emit('auth')" />
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import useSettingsStore from '#stores/settings';
import TextSizeSection from './Sections/TextSizeSection.vue';
import IgnoredSection from './Sections/IgnoredSection.vue';
import NotificationsSection from './Sections/NotificationsSection.vue';
import UsernameColorSection from './Sections/UsernameColorSection.vue';
import ToolbarSection from './Sections/ToolbarSection.vue';
import StatusSection from './Sections/StatusSection.vue';
import OperSection from './Sections/OperSection.vue';

const settings = useSettingsStore();
const emit = defineEmits<{
  (event: 'auth'): void;
}>();
const fontSize = computed(() => settings.fontSize);
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
.settings-wrapper {
  height:calc(100% - 50px);
}
</style>
