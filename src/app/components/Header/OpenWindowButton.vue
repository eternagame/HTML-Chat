<template>
  <button
    class="open-window"
    style="float: right;"
    @click="$emit('input', !value)"
   >
   <v-style>
      button:focus {
        border: {{$vxm.chat.tabbing ? '' : 'none !important'}};
        outline: {{$vxm.chat.tabbing ? '' : 'none !important'}};
      }
    </v-style>
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class OpenWindowButton extends Vue {
    @Prop()
    value!: boolean;
  }
</script>


<style lang="scss" scoped>
  .open-window {
    background-image: url("../../assets/open-window.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 34px;
    width: 35px;
    background-color: transparent;
    border: none;
  }
  .open-window:hover {
    cursor: pointer;
  }
</style>
