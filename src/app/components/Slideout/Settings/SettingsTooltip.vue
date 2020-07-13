<template>
  <span :title="text" class="settings-tooltip">◯
  </span>
</template>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class SettingsTooltip extends Vue {
    @Prop({ required: true })
    text !: string;
  }
</script>
<style>
.settings-tooltip {
  position: relative;
  font-size:16px;
}
.settings-tooltip:before {
  content:"?";
  position:absolute;
  left: 5px;
  top:2px;
  font-size: 12px;
}
</style>
