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
          ref="msg"
          :style="{
            fontStyle:isNotice ? 'italic' : '',
          }"
          v-html="formattedMessage" />
      </span>
      <UserTooltip
        v-if="tooltipVisible"
        v-show="tooltipVisible"
        :user="clickedUser"
        ref="clickTooltip"
        :top="tooltipY"
        :left="tooltipX"
      />
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
  import UserTooltip from './UserTooltip.vue';


  @Component({
    components: {
      Username,
      UserTooltip,
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

    clickedUser!: User;

    @Prop()
    private message!: Message;

    get isAction() {
      return this.message.isAction;
    }

    get formattedMessage(): string {
      // If there are tags, remove them before the message is seen
      const msg = this.message.message;
      if (this.messageHasTags(msg)) {
        const tagsStringPosition = msg.search(/\[(.+,)*.+\]\r?$/);
        return md.renderInline(msg.substring(0, tagsStringPosition));
      } // If not, just show the message
      return md.renderInline(msg);
    }

    mounted() {
      // Gets all of the channel links from markdown
      const channelLinks = this.$refs.msg.getElementsByClassName('channel-link');
      // Spread operators converts HTMLCollectionOf<Element> to HTMLElement[]
      // Iterates through each channel link
      [...channelLinks].forEach(l => {
        // Adds event listener for click
        l.addEventListener('click', (ev) => {
          // When channel link is clicked, change channel
          const channel = l.innerHTML;
          // Makes sure channel exists
          if (Object.keys(this.$vxm.chat.channels).includes(channel)) {
            this.$vxm.chat.chatChannel = channel; // Change the channel name in the header
            // Find the tab number and set it
            this.$vxm.chat.tab = Object.keys(this.$vxm.chat.channels).indexOf(channel);
          } else {
            console.log(`No such channel ${channel}`);
          }
       });
     });
     // Gets all user links from markdown
     const userLinks = this.$refs.msg.getElementsByClassName('user-link');
      // Spread operators converts HTMLCollectionOf<Element> to HTMLElement[]
      // Iterates through each channel link
      [...userLinks].forEach(l => {
        // Adds event listener for hover
        l.addEventListener('mouseenter', (ev) => {
          const user = l.innerHTML.substring(1);
          // Makes sure user exists
          if (Object.keys(this.$vxm.chat.connectedUsers).includes(user)) {
            // Set the user of the tooltip
            this.clickedUser = this.$vxm.chat.connectedUsers[user]!;
            this.tooltipVisible = true; // Make it visible
            /* Ensures information is loaded after the tooltip exists
            The tooltip uses v-if (to limit GET requests)
            If the functions are called right away,
            they could fail because the tooltip doesn't exist yet */
            this.$nextTick(() => {
              // Updates tooltip information
              this.$refs.clickTooltip.findRank();
              this.$refs.clickTooltip.description();
              this.$refs.clickTooltip.specialStatus();
            });
          } else {
            console.log(`No such user ${user}`);
          }
        });
        // Hide the tooltip not hovered over
        l.addEventListener('mouseleave', (ev) => {
          this.tooltipVisible = false;
        });
        // When the mouse is moved, update the tooltip position
        l.addEventListener('mousemove', (e: Event) => {
          const ev = e as MouseEvent;
          this.tooltipX = ev.clientX;
          this.tooltipY = ev.clientY;
        });
        // Opens player profile on click
        l.addEventListener('click', () => {
          const username = l.innerHTML.substring(1);
          const user = this.$vxm.chat.connectedUsers[username];
          if (!user) return;
          window.open(`https://${this.$vxm.chat.workbranch}/web/player/${user.uid}/`);
        });
      });
    }

    tooltipX = 0;

    tooltipY = 0;

    tooltipVisible = false;

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
      msg: HTMLSpanElement;
      clickTooltip: UserTooltip;
    };

    openContextMenu(e: MouseEvent) {
      setTimeout(() => this.$refs.contextMenu.open(e));
    }
  }
</script>

<style lang="scss">
@import "../../assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
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
    margin-right:10px;
    font-size: 20px;
    display: block;
    cursor: pointer;
    overflow: visible;
  }

  mark {
    background-color:darken($dark-blue, 5%) !important;
    color:#c0dce7;
    position:relative;
  }
  blockquote {
    font-weight: bolder;
    display:inline;
  }
  blockquote::before {
    content: "";
    margin-right:2px;
    border:none;
    border-right:5px solid gray;
    border-radius:5px;
    width:5px;
    height:inherit;
  }
  mark:hover {
    color:white;
  }
</style>
