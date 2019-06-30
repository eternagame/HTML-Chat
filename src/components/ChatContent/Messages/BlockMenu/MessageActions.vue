<template>
  <div style="overflow:hidden">
    <a
      class="chat-message-options"
      @click.prevent="openContextMenu"
      v-show="visible"
    >
      &vellip;
    </a>
    <MessageActionsContextMenu
      ref="contextMenu"
      :message="message"
      :test="test"
    />
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '@/types/message';
  import MessageActionsContextMenu from '@/components/ChatContent/Messages/BlockMenu/MessageActionsContextMenu.vue';

  @Component({ components: { MessageActionsContextMenu } })
  export default class MessageActions extends Vue {
    @Prop()
    private message!: Message;

    @Prop()
    private visible!: boolean;

    get test() {
      console.log(this.visible);
      return false;
    }

    openContextMenu(e: MouseEvent) {
      setTimeout(() => this.$refs.contextMenu.open(e));
    }

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
