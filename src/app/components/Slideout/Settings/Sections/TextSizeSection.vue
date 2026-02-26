<template>
  <SettingsSection title="Text Size">
    <input v-model="size" type="number" min="10" max="18" aria-label="Text size">
    <p
      class='font-warning'
      v-show="fontSize < MIN_SIZE || fontSize > MAX_SIZE">
      Font size must be a number between 10 and 18
    </p>
    <SettingsTooltip
      text="Must be a number between 10 and 18. Default is 14"
      class="align-middle"
    />
  </SettingsSection>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import SettingsSection from '../SettingsSection.vue';
import SettingsTooltip from '../SettingsTooltip.vue';

const MIN_SIZE = 10;
const MAX_SIZE = 18;

/** Font size (string) */
const size = ref<string>('14');
const fontSize = computed(() => Number.parseInt(size.value, 10));
watch(fontSize, (value) => {
  if (Number.isNaN(value) || value < MIN_SIZE || value > MAX_SIZE) {
    return;
  }

  vxm.settings.font = value;
  localStorage.chat_fontSize = JSON.stringify(value);
});

onMounted(() => {
  if (localStorage.chat_fontSize) {
    size.value = Number(JSON.parse(localStorage.chat_fontSize)).toString();
  } else {
    size.value = vxm.settings.fontSize.toString();
  }
});
</script>
<style scoped>
.font-warning {
  color:#f39c12;
}
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
</style>
