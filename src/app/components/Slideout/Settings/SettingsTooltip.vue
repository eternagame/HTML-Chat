<template>
  <span
    class="settings-tooltip"
    :id="`settings-tooltip-${text.split(' ').slice(0, 3).join('_')}...`"
  ><pre class="d-inline"> </pre>
    <b-tooltip
      :target="`settings-tooltip-${text.split(' ').slice(0, 3).join('_')}...`"
      variant="light"
      triggers="hover focus"
    >
      {{ text }}
    </b-tooltip>
  </span>
</template>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class SettingsTooltip extends Vue {
    @Prop({ required: true })
    text !: string;
  }
</script>
<style>
.settings-tooltip:before {
  content:"?";
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
