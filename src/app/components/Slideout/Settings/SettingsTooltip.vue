<template>
  <span class="settings-tooltip" v-b-tooltip.v-light :title="text">?</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class SettingsTooltip extends Vue {
  @Prop({ required: true }) text!: string;
}
</script>

<style>
.settings-tooltip {
  font-size: 12px;
  line-height: 1;
  width: 1rem;
  height: 1rem;
  position: absolute;
  border-radius: 50%;
  border: 1px solid white;
  padding: 1px;
  text-align: center;
  display: inline-block;
  margin: 4px;
  cursor:pointer;
  margin-left: 0px;
}
</style>
