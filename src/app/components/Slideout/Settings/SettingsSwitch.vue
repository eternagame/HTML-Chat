<template>
  <label
    class="switch"
    @keypress.enter="$emit('input', !$event.target.checked)"
    :aria-label="label"
    >
    <input
      type="checkbox"
      :checked="value"
      @change="$emit('input', $event.target.checked)"
      :class="{ tabbing: $vxm.chat.tabbing }"
    >
    <span class="slider round" />
  </label>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class SettingsSwitch extends Vue {
    @Prop({ required: true })
    value !: boolean;

    get label() {
      return `Switch that is ${this.value ? 'on' : 'off'}`;
    }
  }
</script>
<style lang="scss" scoped>
@import "@/assets/_custom.scss";
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  vertical-align: middle;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $gray-500;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius:35px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: $green;
}

input:checked + .slider:before {
  -webkit-transform: translateX(16px);
  -ms-transform: translateX(16px);
  transform: translateX(16px);
}

input.tabbing:focus:checked + .slider {
  outline: green 1px solid;
}

input.tabbing:focus:not(:checked) + .slider {
  outline: gray 1px solid;
}
</style>
