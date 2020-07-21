<template>
  <!-- Centers images -->
  <button
    class='border-0'
     @click="$emit('input')"
     :aria-label="`${name} tab`"
  >
    <center
    class='border-0 font-weight-bold text-white d-inline-block'
    @click="$emit('input')"
  >
    <img
    :alt="`${this.selected ? 'Selected' : 'Unselected'} ${name} tab`"
    :src="require(`@/assets/${name}-icon-${selected ? 'green' : 'white'}.png`)"
    >
    <slot />
  </center>
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class SlideoutButton extends Vue {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    selected!: boolean;
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  center {
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    width:40px;
  }
  button {
    background-color:transparent;
  }
</style>
