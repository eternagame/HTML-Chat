<template>
  <div
    class="switch"
    :style="{ width: `${width}px` }"
    :aria-label="label"
    role='checkbox'
    :aria-checked="checked"
  >
    <button type="button" @click="emit('input', false)" :disabled="value === 2" class="disable">
      {{offText}}
    </button>
    <button type="button" @click="emit('input', true)" :disabled="value === 0" class="enable">
      {{onText}}
    </button>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    /** @type {'ALL_ON' | 'MIXED' | 'ALL_OFF'} */
    type: String,
    required: true,
  },
  offText: {
    type: String,
    default: 'OFF',
  },
  onText: {
    type: String,
    default: 'ON',
  },
  width: {
    type: Number,
    default: 80,
  },
});
const emit = defineEmits<{
  (event: 'input', value: boolean): void;
}>();

const label = computed(() => {
  let stateDescription = 'neither';
  if (props.value === 'ALL_ON') {
    stateDescription = props.onText;
  } else if (props.value === 'ALL_OFF') {
    stateDescription = props.offText;
  }
  return `State is ${stateDescription}; possible states ${props.onText}, ${props.offText}, and neither`;
});

const checked = computed(() => {
  switch (props.value) {
    case 'ALL_ON':
      return 'true';
    case 'ALL_OFF':
      return 'false';
    default:
      return 'mixed';
  }
});
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
.switch {
  position: relative;
  display: inline-block;
  height: 1rem;
  vertical-align: middle;
}
button {
  border-radius: 0;
  content:"";
  background-color:$gray-400;
  top:0;
  bottom:0;
  width:50%;
  height:24px;
  position:absolute;
  border:none;
  transition: color 0.4s;
  font-size: 14px;
}
button:focus {
  outline: 0px solid;
  border: $gray-600 2px solid;
}
.disable {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  text-align:center;
  padding:0;
}
.enable {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  left:50%;
  text-align: center;
  padding:0;
}
</style>
