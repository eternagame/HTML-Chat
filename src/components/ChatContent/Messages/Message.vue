<template>
  <li
    class="chat-message"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="chat-message-content">
      <slot />
    </div>
  </li>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';

  @Component({})
  export default class Message extends Vue {
  }
</script>

<style scoped lang="scss">
  .chat-message {
    color: #c0dce7;
    display: block;
    position: relative;
  }
</style>
