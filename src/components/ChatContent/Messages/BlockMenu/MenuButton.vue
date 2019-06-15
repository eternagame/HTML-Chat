<template>
  <div style="overflow:hidden">
    <a
      class="chat-message-options"
      @click.stop="$refs.contextMenu.open"
    >
      &vellip;
    </a>
    <message-context-menu
      ref="contextMenu"
      :message="message"
    />
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '@/types/message';
  import MessageContextMenu from '@/components/ChatContent/Messages/BlockMenu/MessageContextMenu.vue';

  @Component({ components: { MessageContextMenu } })
  export default class MenuButton extends Vue {
    @Prop()
    private message!: Message;

    $refs!: {
      contextMenu: HTMLFormElement;
    }
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
