<template>
  <div id='picker'>
    <ColorSlider
      aria-label="red"
      id='red'
      gradientStart="#300"
      gradientEnd="#c00"
      @sliderChanged="redChanged"
      colorID="red"
      ref="red" />
    <ColorSlider
      aria-label="green"
      id='green'
      gradientStart='#030'
      gradientEnd='#0c0'
      @sliderChanged="greenChanged"
      colorID="green"
      ref="green" />
    <ColorSlider
      aria-label="blue"
      id='blue'
      gradientStart='#003'
      gradientEnd='#00c'
      @sliderChanged="blueChanged"
      colorID="blue"
      ref="blue" />
      <div id='swatch-container'>
        <button
          v-for="(color, i) in defaultColors"
          :key="color"
          class="swatch border-0 m-1"
          :style="{ backgroundColor:color }"
          :aria-label="`default color ${i + 1}`"
          @click="setColor(color)" />
      </div>
    <p
      id='preview'
      style='background-color:#05224b;'
      :style="{ color: color, fontSize:fontSize }" >
        Preview
    </p>
    <p v-show='!validColor' id='warning' :style="{ fontSize:fontSize }">Not enough contrast</p>
  </div>
</template>
<script lang='ts'>
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import ColorSlider from './ColorSlider.vue';
  import User from '@/types/user';

  @Component({
    components: {
      ColorSlider,
    },
  })
  export default class ColorPicker extends Vue {
    $refs!: {
      red: ColorSlider,
      green: ColorSlider,
      blue: ColorSlider,
    };

    red: string = '127';

    blue: string = '127';

    green: string = '127';

    // Colors that appear in the swatches
    defaultColors = ['#f3a891', '#f3c491', '#f3df91', '#e2f391', '#bef391', '#91f3bc', '#f391ba', '#f39196'];

    // For preview
    get color() {
      // If color contrasts well enough with background
      if (this.validColor) {
        // Update vuex
        this.$vxm.chat.usernameColor = `#${this.colorToHexValue(this.red)}${this.colorToHexValue(this.green)}${this.colorToHexValue(this.blue)}`;
          // Set value to localStorage if available
          if (localStorage) {
            localStorage.chat_usernameColor = this.$vxm.chat.usernameColor;
          }
        }
      // Sets color of preview test
      return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }

    // Converts an rgb value (number, 0-255) to a hexadecimal
    colorToHexValue(value:string) {
      return this.int(value).toString(16).padStart(2, '0');
    }

    // Convenience function to help avoid 100+ character in line errors
    int(from:string) {
      return parseInt(from, 10);
    }

    // Gets brightness of a color. Used in contrast calculation
    brightness(r:number, g:number, b:number) {
      return (299 * r + 587 * g + 114 * b) / 1000;
    }

    // Determines whether color contrasts well with background
    get validColor() {
      const backgroundValue = this.brightness(4, 52, 104);
      const colorValue = this.brightness(
        parseInt(this.red, 10),
        parseInt(this.green, 10),
        parseInt(this.blue, 10),
      );
      return Math.abs((colorValue + 0.05) / (backgroundValue + 0.05)) > 4;
    }

    // Sets color to a hex string. Used by color swatches.
    setColor(hex:string) {
      this.red = parseInt(hex.substring(1, 3), 16).toString();
      this.$refs.red.sliderValue = parseInt(hex.substring(1, 3), 16);
      this.green = parseInt(hex.substring(3, 5), 16).toString();
      this.$refs.green.sliderValue = parseInt(hex.substring(3, 5), 16);
      this.blue = parseInt(hex.substring(5, 7), 16).toString();
      this.$refs.blue.sliderValue = parseInt(hex.substring(5, 7), 16);
    }

    redChanged(e:string) {
      this.red = e;
    }

    greenChanged(e:string) {
      this.green = e;
    }

    blueChanged(e:string) {
      this.blue = e;
    }

    // Gets value from localStorage or vuex when created
    created() {
      let color;
      // If value saved in localStorage, use that
      if (localStorage.chat_usernameColor) {
        color = localStorage.chat_usernameColor;
      } else if (this.$vxm.chat.usernameColor !== '' && this.$vxm.chat.usernameColor !== undefined) {
        // If value not in localStorage, check vuex
        color = this.$vxm.chat.usernameColor;
      } else { // If not, make it a random color from the defaults. Then, it saves in localStorage
        color = this.defaultColors[Math.ceil(Math.random() * 8)];
      }
      // Converting hex to decimal
      this.red = parseInt(color.substring(1, 3), 16).toString();
      this.green = parseInt(color.substring(3, 5), 16).toString();
      this.blue = parseInt(color.substring(5, 7), 16).toString();
    }

    get fontSize() {
      return `${this.$vxm.settings.fontSize}px`;
    }
  }
</script>
<style>
  #preview { /* Preview text */
    width: fit-content;
    padding:2px;
    margin-top:5px;
    transition:color 200ms;
  }
  #warning { /* Not enough contrast text */
    color:#f39c12;
  }
  .swatch { /* Swatch colors */
    width:25px;
    height:15px;
  }
  #swatch-container { /* Container for swatches */
    display: grid;
    grid-template-columns: 35px 35px 35px 35px;
    grid-template-rows: 25px 25px;
    margin-left:-5px;
  }
</style>
