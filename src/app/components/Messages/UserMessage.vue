<template>
  <li
    class="chat-message"
    @mouseleave="hover = false"
    @mouseover="hover = true"
  >
    <div>
      <span :class="{'chat-message-action': isAction}">
        <Username
          :user="message.user"
          :color="usernameColor"
          :is-action="isAction"
        >{{ isAction || !message.user.username ? '': ':' }}
        </Username>
        &lrm;<span v-html="formattedMessage" />
      </span>
      &lrm;
      <span class="message-time">[{{formattedTime}}]</span>
    </div>
    <div style="overflow:hidden">
      <a
        class="chat-message-options"
        @click.prevent="openContextMenu"
        v-show="hover && message.user.username"
      >
        &vellip;
      </a>
      <ActionMenu
        ref="contextMenu"
        :message="message"
      />
    </div>
  </li>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import Message from '@/types/message';
  import Username from './Username.vue';
  import ActionMenu from './ActionMenu.vue';
  import md from '@/tools/Markdown';


  @Component({
    components: {
      Username,
      ActionMenu,
    },
  })
  export default class UserMessage extends Vue {
    show!: boolean;

    hover = false;

    @Prop({ default: false })
    private isHistory!: boolean;

    @Prop()
    private message!: Message;

    get isAction() {
      return this.message.isAction;
    }

    get formattedMessage(): string {
      return md.renderInline(this.message.message);
    }

    get formattedTime() {
      return this.message.time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    get usernameColor() {
      if (this.isAction) return '#c0dce7';
      if (this.message.tags) return this.message.tags['username-color'] ?? null;
      return null;
    }

    $refs!: {
      contextMenu: HTMLFormElement;
    };

    openContextMenu(e: MouseEvent) {
      setTimeout(() => this.$refs.contextMenu.open(e));
    }
  }
</script>

<style lang="scss">
  a {
    color: #fff;
  }

  .chat-message {
    display: block;
    position: relative;
  }

  .chat-message-system {
    font-style: italic;
    text-align: center;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .chat-message-action {
    font-style: italic;
  }

  .chat-message-user {
    font-weight: bold;
  }

  .chat-message-action > .chat-message-content > a > .chat-message-user {
    color: #c0dce7;
  }

  .chat-message-time {
    color: #627587;
    white-space: nowrap;
    font-size: 0.8em;
  }

  .chat-message {
    color: #c0dce7;
    display: block;
    position: relative;
  }

  .message-time {
    color: #627587;
    white-space: nowrap;
    font-size: 0.8em;
  }

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
