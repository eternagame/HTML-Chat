<template>
  <div>
    <ColorSlider
      colorID="red"
      :intensity="redIntensity"
      gradientStart="#300"
      gradientEnd="#c00"
      @sliderChanged="redChanged"
    />
    <ColorSlider
      colorID="green"
      :intensity="greenIntensity"
      gradientStart='#030'
      gradientEnd='#0c0'
      @sliderChanged="greenChanged"
    />
    <ColorSlider
      colorID="blue"
      :intensity="blueIntensity"
      gradientStart='#003'
      gradientEnd='#00c'
      @sliderChanged="blueChanged"
    />
    <div class='swatch-container'>
      <button
        type="button"
        v-for="(color, i) in defaultColors"
        :key="color"
        class="swatch border-0 m-1"
        :style="{ backgroundColor: color }"
        :aria-label="`default color ${i + 1}`"
        @click="setColor(color)" />
    </div>
    <p
      class='preview'
      style='background-color:#05224b;'
      :style="{ color: previewColor, fontSize: fontSize }">
      Preview
    </p>
    <p v-show='!validColor' class='warning' :style="{ fontSize: fontSize }">Not enough contrast</p>
  </div>
</template>
<script lang='ts' setup>
import { vxm } from '#store/vxm';
import useSettingsStore from '#stores/settings';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import ColorSlider from './ColorSlider.vue';

const settings = useSettingsStore();

/** Colors that appear in the swatches */
const defaultColors = ['#f3a891', '#f3c491', '#f3df91', '#e2f391', '#bef391', '#91f3bc', '#f391ba', '#f39196'];

const redIntensity = ref<number>(127);
const greenIntensity = ref<number>(127);
const blueIntensity = ref<number>(127);
const previewColor = computed(() => `rgb(${redIntensity.value}, ${greenIntensity.value}, ${blueIntensity.value})`);
const fontSize = computed(() => `${settings.fontSize}px`);

/** Gets brightness of a color. Used in contrast calculation */
function brightness(r:number, g:number, b:number) {
  return (299 * r + 587 * g + 114 * b) / 1000;
}
/** Determines whether color contrasts well with background */
const validColor = computed(() => {
  const backgroundValue = brightness(4, 52, 104);
  const colorValue = brightness(
    redIntensity.value,
    greenIntensity.value,
    blueIntensity.value,
  );
  return Math.abs((colorValue + 0.05) / (backgroundValue + 0.05)) > 4;
});
watch([validColor, redIntensity, greenIntensity, blueIntensity], ([isValid, r, g, b]) => {
  if (!isValid) {
    return;
  }
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  const value = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  vxm.chat.usernameColor = value;
  localStorage.chat_usernameColor = value;
});

function redChanged(intensity: number) {
  redIntensity.value = intensity;
}
function greenChanged(intensity: number) {
  greenIntensity.value = intensity;
}
function blueChanged(intensity: number) {
  blueIntensity.value = intensity;
}

/**
 * Sets color from a hex string (ex. #aabbcc).
 */
function setColor(hex: string) {
  redIntensity.value = parseInt(hex.substring(1, 3), 16);
  greenIntensity.value = parseInt(hex.substring(3, 5), 16);
  blueIntensity.value = parseInt(hex.substring(5, 7), 16);
}

onMounted(() => {
  let initialColor: string;
  if (localStorage.chat_usernameColor && localStorage.chat_usernameColor !== '') {
    initialColor = localStorage.chat_usernameColor;
  } else if (typeof vxm.chat.usernameColor === 'string' && vxm.chat.usernameColor !== '') {
    initialColor = vxm.chat.usernameColor;
  } else {
    initialColor = defaultColors[Math.ceil(Math.random() * defaultColors.length)];
  }
  setColor(initialColor);
});
</script>
<style>
  .preview { /* Preview text */
    width: fit-content;
    padding: 2px;
    margin-top: 5px;
    transition: color 200ms;
  }
  .warning { /* Not enough contrast text */
    color: #f39c12;
  }
  .swatch { /* Swatch colors */
    width: 25px;
    height: 15px;
  }
  .swatch-container { /* Container for swatches */
    display: grid;
    grid-template-columns: 35px 35px 35px 35px;
    grid-template-rows: 25px 25px;
    margin-left:-5px;
  }
</style>
