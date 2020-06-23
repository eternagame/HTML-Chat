<template>
  <label class="switch" :style="{ width: `${width || 64}px` }">
    <button @click="$emit('input', false)" :disabled="value === false" id="disable">
      {{offText || 'OFF'}}
    </button>
    <button @click="$emit('input', true)" :disabled="value === true" id="enable">
      {{onText || 'ON'}}
    </button>
  </label>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class SettingsEnableDisable extends Vue {
    @Prop()
    value !: boolean | null;

    @Prop()
    offText !: string;

    @Prop()
    onText !: string;

    @Prop()
    width !: number;
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.switch {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 20px;
  vertical-align: middle;
}
button {
  border-radius: 0;
  content:"";
  background-color:$gray-400;
  top:0;
  bottom:0;
  width:50%;
  height:20px;
  position:absolute;
  text-align:center;
  border:none;
  transition: color 0.4s;
}
#disable {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
#enable {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  left:50%;
}
</style>
