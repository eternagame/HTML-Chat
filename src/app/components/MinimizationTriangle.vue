<template>
  <div
    class="minimization-triangle"
    style="float: right;"
    :class="{'flipped': value}"
    @click="$emit('input', !value)"
  />
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class MinimizationTriangle extends Vue {
    @Prop()
    value!: boolean;
  }
</script>


<style lang="scss" scoped>
  .minimization-triangle {
    background-image: url("../assets/minimization-triangle.png");
    background-repeat: no-repeat;
    background-size: 60% 40%;
    background-position: center;
    height: 34px;
    width: 35px;
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    animation-name: minimization-triangle-rotation-from;
    animation-duration: 0.2s;
  }

  @keyframes minimization-triangle-rotation-to {
    from {transform: rotate(0deg); -webkit-transform: rotate(0deg);}
    to {transform: rotate(90deg); -webkit-transform: rotate(90deg);}
  }

  @keyframes minimization-triangle-rotation-from {
    to {transform: rotate(0deg); -webkit-transform: rotate(0deg);}
    from {transform: rotate(90deg); -webkit-transform: rotate(90deg);}
  }

  .minimization-triangle.flipped {
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    animation-name: minimization-triangle-rotation-to;
    animation-duration: 0.2s;
  }
</style>
