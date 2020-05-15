<template>
  <div id='picker'>
    <input id='red' class="slider" v-model="red" type=range min=0 max=255>
      <p
        id='red-thumb'
        class='value-thumb'
        :style="{ left:`${(red)/5 - 93}px` }"
      >
        {{ red }}
      </p> <br>
      <input
        id='green'
        class="slider"
        v-model="green"
        type=range
        min=0
        max=255
        >
        <p
            id='green-thumb'
            class='value-thumb'
            :style="{ left:`${(green)/5 - 93}px` }"
        >
            {{ green }}
        </p> <br>
        <input
            id='blue'
            class="slider"
            v-model="blue"
            type=range
            min=0
            max=255
        >
        <p id='blue-thumb'
            class='value-thumb'
            :style="{ left:`${(blue)/5 - 93}px` }"
        >
            {{ blue }}
        </p> <br>
        <div id='swatch-container'>
          <div
            v-for="color in defaultColors"
            :key="color"
            class="swatch"
            :style="{ backgroundColor:color }"
            @click="setColor(color)"
          >
          </div>
        </div>
        <p id='preview' style='background-color:#05224b;' :style="{ color: color }">Preview</p>
        <p v-show='!validColor' id='warning'>Not enough contrast</p>
    </div>
</template>
<script lang='ts'>
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';

  @Component
  export default class ColorPicker extends Vue {
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
              localStorage.usernameColor = this.$vxm.chat.usernameColor;
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
        const colorValue = this.brightness(this.redInt, this.greenInt, this.blueInt);
        return (backgroundValue - colorValue) < 0;
      }

      // Value of this.red as an interger. Another convenience function
      get redInt() {
        return this.int(this.red);
      }

      get greenInt() {
        return this.int(this.green);
      }

      get blueInt() {
        return this.int(this.blue);
      }

      // Sets color to a hex string. Used by color swatches.
      setColor(hex:string) {
        this.red = parseInt(hex.substring(1, 3), 16).toString();
        this.green = parseInt(hex.substring(3, 5), 16).toString();
        this.blue = parseInt(hex.substring(5, 7), 16).toString();
      }

      // Gets value from localStorage or vuex when created
      created() {
        let color;
        if (localStorage.usernameColor) {
          color = localStorage.usernameColor;
        } else {
          color = this.$vxm.chat.usernameColor;
        }
        // Converting hex to decimal
        this.red = parseInt(color.substring(1, 3), 16).toString();
        this.green = parseInt(color.substring(3, 5), 16).toString();
        this.blue = parseInt(color.substring(5, 7), 16).toString();
    }
  }
</script>
<style>
  #preview { /* Preview text */
    width: fit-content;
    padding:2px;
    margin-top:5px;
  }
  #warning { /* Not enough contrast text */
    color:#f39c12;
  }
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
    width:10px;
    height:15px;
  }
  .slider:focus { /* Avoids unwanted outlines */
    outline:none;
    border:none;
  }
  #red { /* Sets gradient for red slider */
    background:-webkit-linear-gradient(left,#200,#a00);
  }
  #green { /* Sets gradient for green slider */
    background:-webkit-linear-gradient(left,#020,#0a0);
  }
  #blue { /* Sets gradient for blue slider */
    background:-webkit-linear-gradient(left,#002,#00a);
  }
  /* Overlays that show the value of the slider on top of the draggable part of the slider */
  .value-thumb {
    position:relative;
    /* Disables clicks or highlights to the text, so they 'pass through' to the slider */
    pointer-events:none;
    vertical-align:top;
    overflow-x:hidden;
    text-align:center;
    margin-right:0px;
    width:40px;
    border-radius:2px;
    display:inline-block;
  }
  .swatch { /* Swatch colors */
    width:25px;
    height:15px;
    margin:5px;
  }
  #swatch-container { /* Container for swatches */
    display: grid;
    grid-template-columns: 35px 35px 35px 35px;
    grid-template-rows: 25px 25px;
    margin-left:-5px;
  }
</style>
