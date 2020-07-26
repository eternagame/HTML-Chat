<template>
  <button
    :aria-label="label"
    class="minimization-triangle float-right border-0 "
    :class="{
      'flipped': value && !settings,
      'settings-flipped': value && settings,
      'settings':settings,
    }"
    @click="$emit('input', !value)"
  >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class MinimizationTriangle extends Vue {
    @Prop({ required: true })
    value!: boolean;

    @Prop({ default: false })
    settings !: boolean;

    get label() {
      return `${this.value ? 'Show' : 'Hide'}`;
    }
  }
</script>


<style lang="scss" scoped>
  .minimization-triangle { /* Normal state */
    background-image: url("~@/assets/minimization-triangle.png");
    background-repeat: no-repeat;
    background-size: 60% 40%;
    background-position: center;
    height: 34px;
    width: 35px;
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transition: transform 0.2s;
    background-color: transparent;
  }

  .minimization-triangle.settings-flipped {
    transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
    // animation: minimization-triangle-rotation-from-settings 0.2s !important;
    transition: transform 0.2s;
  }

  .settings {
    // animation: minimization-triangle-rotation-to-settings 0.2s !important;
    transition: transform 0.2s;
  }

  .minimization-triangle.flipped { /* Button in minimized state */
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    transition: transform 0.2s;
  }

  .minimization-triangle:hover {
    cursor: pointer;
  }
</style>
