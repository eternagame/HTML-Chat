<template>
  <button
    type="button"
    class="open-window border-0"
    style="float: right;"
    @click="emit('input', !value)"
    :aria-label="label"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits<{
  (event: 'input', value: boolean): void,
}>();
const label = computed(() => `Make chat ${props.value ? 'fullscreen' : 'normal size'}`);
</script>

<style lang="scss" scoped>
  .open-window {
    background-image: url("~@/assets/open-window.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 34px;
    width: 35px;
    background-color: transparent;
  }
  .open-window:hover {
    cursor: pointer;
  }
</style>
