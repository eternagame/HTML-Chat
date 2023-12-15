<template>
  <button
    class="hamburger d-inline-block border-0 align-top"
    @click="$emit('input', !value)"
    :class="{
      notified:notification,
      mentioned:mention,
    }"
    :aria-label="`${this.value ? 'Close' : 'Open'} slideout`"
  >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class HamburgerMenuButton extends Vue {
    @Prop({ required: true })
    value!: boolean;

    @Prop({ default: false })
    notification!: boolean;

    @Prop({ default: false })
    mention!: boolean;
  }
</script>
<style scoped>
.hamburger { /* Normal hamburger icon */
  width:40px;
  height:40px;
  background-image: url("~@/assets/hamburger.png");
  background-repeat: no-repeat;
  background-size: 50% 45%;
  background-position: bottom 10px left 11px;
  background-color: transparent;
}
.notified { /* Notified hamburger icon */
  background-image: url("~@/assets/hamburger-notification.png");
  background-size: 62.5% 55%;
  background-position:bottom 10px left 11px;
}
.mentioned { /* Mentioned hamburger icon */
  background-image: url("~@/assets/hamburger-mention.png") !important;
}
</style>
