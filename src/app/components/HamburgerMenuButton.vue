<template>
  <span
    class="hamburger"
    @click="$emit('input', !value)"
  />
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class HamburgerMenuButton extends Vue {
    @Prop()
    value!: boolean;
  }
</script>
<style scoped>
.hamburger {
  background-image: url("../assets/hamburger.png");
  background-repeat: no-repeat;
  background-size: 40% 40%;
  background-position: center;
  display:inline-block;
  width:40px;
  height:40px;
}
</style>
