<template>
  <div class="tooltiptext">
    <slot></slot>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';

  @Component({})
  export default class DictionaryTooltip extends Vue {
  }
</script>

<style scoped lang="scss">
</style>
