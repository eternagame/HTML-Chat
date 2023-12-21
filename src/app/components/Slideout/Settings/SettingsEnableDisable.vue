<template>
  <div
    class="switch"
    :style="{ width: `${width}px` }"
    :aria-label="label"
    role='checkbox'
    :aria-checked="checked"
  >
    <button type="button" @click="$emit('input', false)" :disabled="value === 2" class="disable">
      {{offText}}
    </button>
    <button type="button" @click="$emit('input', true)" :disabled="value === 0" class="enable">
      {{onText}}
    </button>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

enum States {
  ALL_ON,
  SOME_ON,
  ALL_OFF,
}

@Component
export default class SettingsEnableDisable extends Vue {
  @Prop({ required: true }) value!: States;

  @Prop({ default: 'OFF' }) offText!: string;

  @Prop({ default: 'ON' }) onText!: string;

  @Prop({ default: 80 }) width!: number;

  get label() {
    let stateDescription = 'neither';
    if (this.value === States.ALL_ON) stateDescription = this.onText;
    else if (this.value === States.ALL_OFF) stateDescription = this.offText;
    return `State is ${stateDescription}; possible states ${this.onText}, ${this.offText}, and neither`;
  }

  get checked() {
    if (this.value === States.ALL_ON) return 'true';
    if (this.value === States.ALL_OFF) return 'false';
    return 'mixed';
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
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
.disable {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  text-align:center;
  padding:0;
}
.enable {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  left:50%;
  text-align: center;
  padding:0;
}
</style>
