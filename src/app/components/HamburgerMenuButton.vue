<template>
  <span
    class="hamburger"
    @click="$emit('input', !value)"
    :class="{notified:notification}"
  />
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class HamburgerMenuButton extends Vue {
    @Prop()
    value!: boolean;

    @Prop()
    notification!: boolean;
  }
</script>
<style scoped>
.hamburger {
  display:inline-block;
  width:40px;
  height:40px;
  background-image: url("../assets/hamburger.png");
  background-repeat: no-repeat;
  background-size: 50% 45%;
  background-position: bottom 10px left 11px;
  transition: background-image background-size 1s;
}
.notified {
  background-image: url("../assets/hamburger-notification.png");
  background-size: 62.5% 55%;
  background-position:bottom 10px left 11px;
}
</style>
