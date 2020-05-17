<template>
  <div class='color-slider-container'>
    <input
      class="slider"
      v-model="sliderValue"
      type=range min=0 max=255
      :style='{ background:getGradient()}'>
    <p
      class='value-thumb'
      :style="{ left:calculateOffset() }"
    >
      {{ sliderValue }}
    </p> <br>
  </div>
</template>
<script lang='ts'>
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';

  @Component
  export default class ColorSlider extends Vue {
    sliderValue = 127;

    @Prop() // Starting color for slider gradient
    gradientStart !: string;

    @Prop() // Ending color for slider gradient
    gradientEnd !: string;

    @Prop() // Red, green, or blue. Used to fetch value from localStorage/vuex
    colorID !: string;

    calculateOffset() { // Position of text on slider thumb
      return `${this.sliderValue / 5 - 93}px`;
    }

    @Watch('sliderValue') // Updates parent, ColorPicker
    sliderChanged() {
      this.$emit('sliderChanged', this.sliderValue);
    }

    getGradient() {
      return `-webkit-linear-gradient(left,${this.gradientStart},${this.gradientEnd})`;
    }

    // Gets value from localStorage or vuex when created
    created() {
        let color;
        if (localStorage.usernameColor) {
          color = localStorage.usernameColor;
        } else {
          color = this.$vxm.settings.usernameColor;
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
.slider { /* Sliders for color values */
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border: none;
    border-radius:2px;
    height:15px;
    margin:2px;
    margin-left:0px;
    width:90px;
  }
  .slider::-webkit-slider-thumb { /* Draggable part of slider */
    -webkit-appearance: none;
    appearance: none;
    background-color:#7b8a8b;
    width:40px;
    height:15px;
  }
  .slider::-moz-range-thumb { /* Draggable part of slider (for firefox compatibility) */
    background-color:#7b8a8b;
    width:40px;
    height:15px;
  }
  .slider:focus { /* Avoids unwanted outlines */
    outline:none;
    border:none;
  }
  /* Overlays that show the value of the slider on top of the draggable part of the slider */
  .value-thumb {
    position:relative;
    /* Disables clicks or highlights to the text, so they 'pass through' to the slider */
    pointer-events:none;
    vertical-align:top;
    overflow-x:hidden;
    text-align:center;
    width:40px;
    display:inline-block;
    margin:0px;
  }
</style>
