<template>
  <div class='color-slider-container overflow-hidden ml-0 mt-2 mb-2'>
    <input
      :aria-label="colorId"
      class="slider border-0"
      v-model="sliderValue"
      type=range min=0 max=255
      :style='{ background:getGradient()}'
      :name="colorID">
    <span
      class="value-thumb text-center overflow-hidden d-inline-block"
      :style="{ left: calculateOffset}"
    >{{sliderValue}}</span>
    <input type=number v-model="sliderValue" class="slider-input-number">
  </div>
</template>
<script lang='ts'>
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import ColorPicker from './ColorPicker.vue';

  @Component
  export default class ColorSlider extends Vue {
    sliderValue = 127;

    @Prop({ required: true }) // Starting color for slider gradient
    gradientStart !: string;

    @Prop({ required: true }) // Ending color for slider gradient
    gradientEnd !: string;

    @Prop({ required: true }) // Red, green, or blue. Used to fetch value from localStorage/vuex
    colorID !: string;

    defaultColors = ['#f3a891', '#f3c491', '#f3df91', '#e2f391', '#bef391', '#91f3bc', '#f391ba', '#f39196'];

    get calculateOffset() { // Position of text on slider thumb
      const percent = this.sliderValue / (255); // Slider value as percent
      // Range = slider width - thumb width. Means slider can go from 0 to 80 pixels
      const range = (120 - 40);
      const percentPixels = percent * range; //
      return `${percentPixels + 1}px`;
    }

    @Watch('sliderValue') // Updates parent, ColorPicker
    sliderChanged() {
      this.$emit('sliderChanged', this.sliderValue);
    }

    getGradient() { // Applies color gradient
      return `-webkit-linear-gradient(left,${this.gradientStart},${this.gradientEnd})`;
    }

    // Gets value from localStorage, parent, or vuex when created
    created() {
        let color;
        if (localStorage.chat_usernameColor) {
          color = localStorage.chat_usernameColor;
        } else if (this.$vxm.chat.usernameColor !== '' && this.$vxm.chat.usernameColor !== undefined) {
          color = this.$vxm.chat.usernameColor;
        } else {
          color = (this.$parent as ColorPicker).color;
        }
        switch (this.colorID) {
          case 'red':
            this.sliderValue = parseInt(color.substring(1, 3), 16);
            break;
          case 'green':
            this.sliderValue = parseInt(color.substring(3, 5), 16);
            break;
          case 'blue':
            this.sliderValue = parseInt(color.substring(5, 7), 16);
            break;
          default: break;
        }
      }
  }
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
