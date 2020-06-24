<template>
  <label class="switch" :style="{ width: `${width || 80}px` }" :aria-label="label">
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

    get label() {
      return `Three state switch in state ${this.value === true ? (this.onText || 'on') : (this.offText || 'off') || 'neither'}; possible states ${this.onText || 'on'}, ${this.offText || 'off'}, and neither`;
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.switch {
  position: relative;
  display: inline-block;
  height: 1rem;
  vertical-align: middle;
}
button {
  border-radius: 0;
  content:"";
  background-color:$gray-400;
  top:0;
  bottom:0;
  width:50%;
  height:24px;
  position:absolute;
  border:none;
  transition: color 0.4s;
  font-size: 14px;
}
button:focus {
  outline: 0px solid;
  border: $gray-600 2px solid;
}
#disable {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  text-align:center;
  padding:0;
}
#enable {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  left:50%;
  text-align: center;
  padding:0;
}
</style>
