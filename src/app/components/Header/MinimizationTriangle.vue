<template>
  <button
    type="button"
    :aria-label="label"
    class="minimization-triangle float-right border-0 "
    :class="{
      flipped: value,
      settings: settings,
    }"
    @click="emit('input', !value)"
  />
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
  settings: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits<{
  (event: 'input', value: boolean): void
}>();
const label = computed(() => (props.value ? 'Show' : 'Hide'));
</script>

<style lang="scss" scoped>
  .minimization-triangle { /* Normal state */
    background-image: url("~@/assets/minimization-triangle.png");
    background-repeat: no-repeat;
    background-size: 60% 40%;
    background-position: center;
    height: 34px;
    width: 35px;
    transform: rotate(0deg);
    transition: transform 0.2s;
    background-color: transparent;
  }

  .minimization-triangle.flipped { /* Button in minimized state */
    transform: rotate(90deg);
  }

  .minimization-triangle.flipped.settings {
    transform: rotate(-90deg);
  }
</style>
