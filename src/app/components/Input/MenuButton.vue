<template>
  <button
    type="button"
    class='menu-button border-0 text-white float-left'
    :style="style"
    @click="emit('button', name)"
    @dblclick="emit('close')"
  >
    {{name}}
  </button>
</template>
<script lang='ts' setup>
import { computed } from 'vue';
import getStyles from './Styles';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  styles: {
    type: String,
    required: true,
  },
});
const emit = defineEmits<{
  (event: 'button', name: string): void
  (event: 'close'): void
}>();

const style = computed(() => getStyles(props.styles));
</script>
<style scoped>
.menu-button {
  height:25px;
  background-color:#043468;
  width:30px; /* Corresponds to a real width of 25px accounting for border */
  font-size:14px;
}
.menu-button:hover {
  background-color:#21508c; /* Lightened version of med-dark-blue. Same as input background */
}
</style>
