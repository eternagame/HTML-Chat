<template>
  <span>[{{formattedTime}}]</span>
</template>

<script lang="ts">
import { parseUsername } from "@/tools/ParseUsername";
import { Component, Prop } from "vue-property-decorator";
import Vue from "@/types/vue";
import { User } from "../../../types/user";

@Component
export default class Time extends Vue {
  @Prop()
  time!: Date;

  get formattedTime(){
    return this.time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  }
}
</script>

<style scoped lang="scss">
span {
  color: #627587;
  white-space: nowrap;
  font-size: 0.8em;
}
</style>
