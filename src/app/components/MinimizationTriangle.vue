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
    height: 24px;
    width: 25px;
    transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
  }

  .minimization-triangle.flipped {
    transform: rotate(270deg);
    -webkit-transform: rotate(270deg);
  }
</style>
