<template>
  <li
    class="chat-message"
    @mouseleave="hover = false"
    @mouseover="hover = true"
  >
    <div :style="{ textAlign: isNotice ? 'center' : 'left'}">
      <span :class="{'chat-message-action': isAction}">
        <Username
          :user="message.user"
          :color="usernameColor"
          :is-action="isAction"
          v-if="!isNotice"
        >{{ isAction || !message.user.username ? '': ':' }}
        </Username>
        &lrm;<span
          :style="{
            fontStyle:isNotice ? 'italic' : '',
          }"
          v-html="formattedMessage" />
      </span>
      &lrm;
      <span v-if="!isNotice" class="message-time">[{{formattedTime}}]</span>
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
  import User from '@/types/user';
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

    get isNotice() {
      return this.message.isNotice;
    }

    @Prop()
    private message!: Message;

    get isAction() {
      return this.message.isAction;
    }

    get formattedMessage(): string {
      // If there are tags, remove them before the message is seen
      if (this.messageHasTags(this.message.message)) {
        const tagsStringPosition = this.message.message.search(/\[(.+,)*.+\]\r?$/);
        return md.renderInline(this.message.message.substring(0, tagsStringPosition));
      } // If not, just show the message
      return md.renderInline(this.message.message);
    }

    get formattedTime() {
      return this.message.time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    get usernameColor() {
      if (this.isAction) return '#c0dce7';
      const colorValue: string | null = this.parseMessageTags(this.message.message)[0];
      return colorValue; // Color value is first message tag
    }

    parseMessageTags(message:string) { // Gets tags as array from message
      const tagsStringPosition = message.search(/\[(.+,)*.+\]\r?$/); // Searches for [...,...] at end of message
      let tagsString = message.substring(tagsStringPosition); // Gets tags as a string
      if (tagsString.includes('\r')) { // In history messages, message ends with \r
        tagsString = tagsString.substring(1, tagsString.length - 2); // Removes bracket
      } else {
        tagsString = tagsString.substring(1, tagsString.length - 1); // Removes bracket
      }
      return tagsString.split(','); // Returns array split by commas
    }

    messageHasTags(message:string) { // If a message has any tags
      return message.match(/\[(.+,)*.+\]\r?$/);
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
