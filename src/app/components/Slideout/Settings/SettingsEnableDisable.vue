<template>
  <label class="switch" :style="{ width: `${width}px` }" :aria-label="label">
    <button @click="$emit('input', false)" :disabled="value === false" id="disable">
      {{offText}}
    </button>
    <button @click="$emit('input', true)" :disabled="value === true" id="enable">
      {{onText}}
    </button>
  </label>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class SettingsEnableDisable extends Vue {
    @Prop()
    value : boolean | null = null;

    @Prop({ default: 'OFF' })
    offText : string = 'OFF';

    @Prop({ default: 'ON' })
    onText: string = 'ON';

    @Prop({ default: 80 })
    width : number = 80;

    get label() {
      return `Three state switch in state ${this.value === true ? (this.onText) : (this.offText) || 'neither'}; possible states ${this.onText}, ${this.offText}, and neither`;
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
