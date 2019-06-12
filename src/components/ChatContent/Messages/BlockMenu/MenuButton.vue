<template>
  <div style="overflow:hidden">
    <a
      class="chat-message-options"
      @click.stop="$store.commit('openContextMenu', {event: $event, message})"
    >&vellip;</a>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '../../../../types/message';

  @Component({ components: {} })
  export default class MenuButton extends Vue {
    @Prop()
    private message!: Message;
  }
</script>

<style lang="scss">
.chat-message-options {
  user-select: none;
  position: absolute;
  top: -4px;
  right: 15px;
  font-size: 20px;
  display: block;
  cursor: pointer;
  overflow: visible;
}
</style>
