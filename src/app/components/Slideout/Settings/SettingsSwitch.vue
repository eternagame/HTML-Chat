<template>
  <label
    class="switch"
    @keypress.enter="emit('input', !$event.target.checked)"
    :aria-label="label"
  >
    <input
      type="checkbox"
      :checked="value"
      @change="emit('input', $event.target.checked)"
      :class="{ tabbing: tabbing }"
    >
    <span class="slider round" />
  </label>
</template>
<script lang="ts" setup>
import { vxm } from '#store/vxm';
import { computed } from 'vue';

const props = defineProps<{ value: boolean }>();
const emit = defineEmits<{
  (event: 'input', value: boolean): void;
}>();
const label = computed(() => `Switch that is ${props.value ? 'on' : 'off'}`);
const tabbing = computed(() => vxm.chat.tabbing);
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  vertical-align: middle;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $gray-500;
  transition: .4s;
  border-radius:35px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: $green;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

input.tabbing:focus:checked + .slider {
  outline: green 1px solid;
}

input.tabbing:focus:not(:checked) + .slider {
  outline: gray 1px solid;
}
</style>
