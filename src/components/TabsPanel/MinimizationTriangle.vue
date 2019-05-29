<template>
  <div
    style="float: right;"
    id="minimization-triangle"
    :class="{'flipped': $store.state.minimized}"
    @click="$store.state.minimized = !$store.state.minimized"
  ></div>
</template>

<script lang="ts">
import Vue from "@/types/vue";
import { Component, Prop } from "vue-property-decorator";

@Component
export default class MinimizationTriangle extends Vue {
}
</script>


<style lang="scss" scoped>
/************* Minimization Triangle *************/
#minimization-triangle {
  background-image: url("../../assets/minimization-triangle.png");
  background-repeat: no-repeat;
  background-size: 60% 40%;
  background-position: center;
  height: 24px;
  width: 25px;
  transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
}

#minimization-triangle.flipped {
  transform: rotate(270deg);
  -webkit-transform: rotate(270deg);
}
</style>
