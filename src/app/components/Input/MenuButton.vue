<template>
  <button
    class='menu-button'
    :style="{
      'font-weight':styles.includes('bold') ? 'bold' : 'normal', /* Applies text styling */
      'font-style':styles.includes('italics') ? 'italic' : 'normal',
      'text-decoration':styles.includes('underline') ? 'underline' : 'normal',
    }"
    @click="$emit('button', name)"
  >
    {{name}}
    <v-style>
      .menu-button:focus {
        outline: {{ tabbing ? '' : 'none !important'}};
      }
    </v-style>
  </button>
</template>
<script lang='ts'>
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  @Component
  export default class MenuButton extends Vue {
    @Prop()
    name!:string;

    @Prop()
    styles!: string;

    get tabbing() {
      return this.$vxm.chat.tabbing;
    }
  }
</script>
<style scoped>
.menu-button {
  height:25px;
  background-color:#043468;
  border:none;
  width:30px; /* Corresponds to a real width of 25px accounting for border */
  color:white;
  float:left;
  font-size:14px;
}
.menu-button:hover {
  background-color:#21508c; /* Lightened version of med-dark-blue. Same as input background */
}
</style>
