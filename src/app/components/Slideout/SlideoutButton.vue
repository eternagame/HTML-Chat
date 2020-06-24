<template>
  <!-- Centers images -->
  <button @click="$emit('input')" :aria-label="`Open the ${name} tab of the slideout`">
    <center
    @click="$emit('input')"
  >
    <img
    :alt="`${this.selected ? 'Selected' : 'Unselected'} ${name} tab image`"
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
    @Prop()
    name!: string;

    @Prop({ required: true })
    selected!: boolean;
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  center {
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    font-family: "Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    text-transform: capitalize;
    width:40px;
    display:inline-block;
  }
  button {
    background-color:transparent;
    border:none;
  }
</style>
