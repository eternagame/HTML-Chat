<template>
  <div class='color-slider-container overflow-hidden ml-0 mt-2 mb-2'>
    <input
      :aria-label="colorID"
      class="slider border-0"
      v-model="sliderValueText"
      type="range"
      min="0"
      max="255"
      :style='{ background: gradientBg }'
      :name="colorID">
    <span
      class="value-thumb text-center overflow-hidden d-inline-block"
      :style="{ left: thumbOffset }"
    >{{sliderValue}}</span>
    <input type="number" v-model="sliderValueText" class="slider-input-number" min="0" max="255" :aria-label="colorID">
  </div>
</template>
<script lang='ts' setup>
import { computed, ref, watch } from 'vue';

const MIN_VALUE = 0;
const MAX_VALUE = 255;

const props = defineProps<{
  /** 0 - 255 */
  intensity?: number;
  gradientStart: string;
  gradientEnd: string;
  colorID: string;
}>();
const emit = defineEmits<{
  (event: 'sliderChanged', value: number): void;
}>();

const sliderValueText = ref<string>('127');
const sliderValue = computed(() => Number.parseInt(sliderValueText.value, 10));
watch(() => props.intensity, intensity => {
  if (typeof intensity === 'number') {
    sliderValueText.value = Math.min(Math.max(intensity, MIN_VALUE), MAX_VALUE).toString();
  }
});
watch(sliderValue, (value) => {
  emit('sliderChanged', value);
});

/** Position of text on slider thumb */
const thumbOffset = computed(() => {
  // Slider value as percent
  const percent = sliderValue.value / 255;
  // Range = slider width - thumb width. Means slider can go from 0 to 80 pixels
  const range = (120 - 40);
  const percentPixels = percent * range;
  return `${percentPixels + 1}px`;
});

const gradientBg = computed(() => `linear-gradient(to right, ${props.gradientStart}, ${props.gradientEnd})`);
</script>
<style scoped>
  .color-slider-container { /* Container */
    position:relative;
    height:20px;
    width:180px;
  }
  .slider { /* Sliders for color values */
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border-radius:2px;
    height:15px;
    margin:2px;
    width:120px;
  }
  .slider::-webkit-slider-thumb { /* Draggable part of slider (for webkit compatibility) */
    -webkit-appearance: none;
    appearance: none;
    background-color:#7b8a8b;
    width:40px;
    height:15px;
    border-radius:2px;
  }
  .slider::-moz-range-thumb { /* Draggable part of slider (for firefox compatibility) */
    background-color:#7b8a8b;
    appearance: none;
    width:40px;
    height:15px;
    border-radius:2px;
  }
  .slider:focus {
    outline:none;
    border:1px solid black;
  }
  /* Overlays that show the value of the slider on top of the draggable part of the slider */
  .value-thumb {
    position:absolute;
    /* Disables clicks or highlights to the text, so they 'pass through' to the slider */
    pointer-events:none;
    width:40px;
    font-size: 14px !important;
    height:20px;
    top: 0px;
  }
  .slider-input-number {
    display: inline-block;
    position: absolute;
    width: 3rem;
    height: 100%;
    top: 0px;
    right: 0;
  }
</style>
