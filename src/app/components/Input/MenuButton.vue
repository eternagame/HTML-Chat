<template>
  <button
    class='menu-button'
    :style="style"
    @click="$emit('button', name)"
    @dblclick="$emit('close')"
  >
    {{name}}
  </button>
</template>
<script lang='ts'>
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import getStyles from './Styles';
  @Component
  export default class MenuButton extends Vue {
    @Prop({ required: true })
    name:string = '';

    @Prop({ required: true })
    styles: string = '';

    get style() {
      const normal = getStyles(this.styles);
      normal.tabbing = this.$vxm.chat.tabbing;
      return normal;
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
button:not(.tabbing):focus {
  outline: none;
  border: none;
}
</style>
