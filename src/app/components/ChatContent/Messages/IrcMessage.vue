<template>
  <Message
    style="overflow: hidden"
    @mouseleave="hover = false"
    @mouseover="hover = true"
  >
    <div>
      <span :class="{'chat-message-action': isAction}">
        <Username
          :user="message.user"
          :color="message.tags ? message.tags['username-color'] || '' : ''"
          :is-action="isAction"
        >{{ isAction || !message.user.username ? '': ':' }}
        </Username>
        &lrm;<span v-html="formattedMessage" />
      </span>
      &lrm;<MessageTime :time="message.time" />
    </div>
    <MessageActions
      :visible="hover && message.user.username"
      :message="message"
    />
  </Message>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '@/types/message';
  import Username from './Username.vue';
  import MessageComp from './Message.vue';
  import MessageActions from '@/components/ChatContent/Messages/BlockMenu/MessageActions.vue';
  import md from '@/tools/Markdown';
  import Time from './Time.vue';

  @Component({
    components: {
      Username,
      Message: MessageComp,
      MessageActions,
      MessageTime: Time,
    },
  })
  export default class IrcMessage extends Vue {
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
  }
</script>

<style lang="scss">
  a {
    color: #fff;
  }

  .chat-message {
    color: #c0dce7;
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

  .chat-message-user-link {
    text-decoration: none;
  }

  .chat-message-time {
    color: #627587;
    white-space: nowrap;
    font-size: 0.8em;
  }
</style>
