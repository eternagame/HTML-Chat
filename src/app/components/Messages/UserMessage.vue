<template>
  <li
    class="chat-message d-block"
    @mouseleave="hover = false"
    @mouseover="hover = true"
    v-if="display"
  >
    <div :style="{ textAlign: isNotice ? 'center' : 'left'}" class="message-container">
      <span :class="{'chat-message-action': isAction}">
        <Username
          :user="message.user"
          :color="usernameColor"
          :is-action="isAction"
          @focus="hover = true"
          v-if="!isNotice && !grouped"
        >{{ isAction || !message.user || !message.user.username ? '': ':' }}
        </Username>
        &nbsp;
        <span
          ref="msg"
          :class="{ notice: isNotice }"
          v-html="formattedMessage" />
      </span>
      <UserTooltip
        v-if="tooltipVisible"
        :user="clickedUser"
        ref="clickTooltip"
        :top="tooltipY"
        :left="tooltipX"
        @hide="tooltipVisible = false"
      />
      <PuzzleTooltip
        v-if="puzzleTooltipVisible"
        :pid="pid"
        ref="puzzleTooltip"
        :top="puzzleTooltipY"
        :left="puzzleTooltipX"
        @hide="puzzleTooltipVisible = false"
      />
      &lrm;
      <span
        v-if="!isNotice && formattedTime !== 'Invalid Date' && !grouped"
        class="message-time"
      >
        [{{formattedTime}}]
      </span>
    </div>
    <ItemOptions :user="message.user" :message="message" :hover="hover" class="options" />
    <LinkModal ref="linkModal" url=''/>
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
  import LinkModal from '@/components/LinkModal.vue';
  import { Channel } from '@/store/chat.vuex';
  import PuzzleTooltip from './PuzzleTooltip.vue';
  import ItemOptions from '@/components/ItemOptions.vue';

  @Component({
    components: {
      Username,
      UserTooltip,
      ActionMenu,
      LinkModal,
      PuzzleTooltip,
      ItemOptions,
    },
  })
  export default class UserMessage extends Vue {
    show!: boolean;

    hover = false;

    @Prop({ required: true })
    display !: boolean;

    @Prop({ default: false })
    private isHistory !: boolean;

    @Prop({ default: false })
    grouped !: boolean;

    get isNotice() {
      return this.message.isNotice;
    }

    clickedUser!: User;

    pid !: number;

    @Prop({ required: true })
    private message!: Message;

    get isAction() {
      return this.message.isAction;
    }

    get formattedMessage(): string {
      // If there are tags, remove them before the message is seen
      let msg = this.message.message;
      if (!msg) return '';
      if (this.messageHasTags(msg)) {
        const tagsStringPosition = msg.search(/\[#(.+,)*.+\]\r?$/);
        msg = msg.substring(0, tagsStringPosition);
      } // If not, just show the message
      const markdown = md.renderInline(msg);
      return markdown;
    }

    mounted() {
      if (!this.$el || !this.$refs.msg) return;
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
        l.addEventListener('click', (ev) => {
          const user = l.innerHTML.substring(1);
          // Makes sure user exists
          if (Object.keys(this.$vxm.chat.connectedUsers).includes(user)) {
            // Set the user of the tooltip
            this.clickedUser = this.$vxm.chat.connectedUsers[user]!;
            this.tooltipVisible = true; // Make it visible
            this.tooltipX = (ev as MouseEvent).clientX
              || (ev.target as Element).getBoundingClientRect().x;
            this.tooltipY = (ev as MouseEvent).clientY
              || (ev.target as Element).getBoundingClientRect().y;
            /* Ensures information is loaded after the tooltip exists
            The tooltip uses v-if (to limit GET requests)
            If the functions are called right away,
            they could fail because the tooltip doesn't exist yet */
            this.$nextTick(() => {
              // Updates tooltip information
              this.$refs.clickTooltip.fillProfile();
            });
          } else {
            console.log(`No such user ${user}`);
          }
        });
      });
      // Gets puzzle links from markdown
      const puzzleLinks = this.$refs.msg.getElementsByClassName('puzzle-link');
      // Spread operators converts HTMLCollectionOf<Element> to HTMLElement[]
      // Iterates through each channel link
      [...puzzleLinks].forEach(l => {
        // Adds event listener for hover
        l.addEventListener('click', (ev) => {
          const url = (l as HTMLElement).innerText;
          const matches = url.match(/\d+\/?$/);
          this.pid = parseInt((matches ? matches[0] : '0'), 10);
          this.puzzleTooltipVisible = true; // Make it visible
          this.puzzleTooltipX = (ev as MouseEvent).clientX
            || (ev.target as Element).getBoundingClientRect().x;
          this.puzzleTooltipY = (ev as MouseEvent).clientY
            || (ev.target as Element).getBoundingClientRect().y;
            /* Ensures information is loaded after the tooltip exists
            The tooltip uses v-if (to limit GET requests)
            If the functions are called right away,
            they could fail because the tooltip doesn't exist yet */
            this.$nextTick(() => {
              // Updates tooltip information
              this.$refs.puzzleTooltip.fill();
          });
        });
      });
      [...this.$el.getElementsByClassName('external-link')]
        .forEach((el) => {
          const e = el as HTMLAnchorElement;
          e.addEventListener('click', ev => {
            ev.preventDefault();
            if (e.href.trim() !== '' && !e.href.match(/(https?:\/\/)?eternagame\.org\/(game\/)?puzzles?\/\d+\/?/)) this.$refs.linkModal.open(e.href);
          });
      });
    }

    openLinkModal = false;

    tooltipX = 0;

    tooltipY = 0;

    tooltipVisible = false;

    puzzleTooltipX = 0;

    puzzleTooltipY = 0;

    puzzleTooltipVisible = false;

    get formattedTime() {
      return new Date(this.message.time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    get usernameColor() {
      if (this.isAction) return '#c0dce7';
      const colorValue: string | null = this.parseMessageTags(this.message.message)[0];
      return colorValue; // Color value is first message tag
    }

    parseMessageTags(message:string) { // Gets tags as array from message
      if (!message) return [];
      const tagsStringPosition = message.search(/\[#(.+,)*.+\]\r?$/); // Searches for [...,...] at end of message
      let tagsString = message.substring(tagsStringPosition); // Gets tags as a string
      if (tagsString.includes('\r')) { // In history messages, message ends with \r
        tagsString = tagsString.substring(1, tagsString.length - 2); // Removes bracket
      } else {
        tagsString = tagsString.substring(1, tagsString.length - 1); // Removes bracket
      }
      return tagsString.split(','); // Returns array split by commas
    }

    messageHasTags(message:string) { // If a message has any tags
      if (!message) return false;
      return message.match(/\[#(.+,)*.+\]\r?$/);
    }

    $refs!: {
      msg: HTMLSpanElement;
      clickTooltip: UserTooltip;
      linkModal: LinkModal;
      puzzleTooltip: PuzzleTooltip;
    };
  }
</script>

<style lang="scss">
@import "~@/assets/_custom.scss";
  .chat-message {
    position: relative;
  }

  .chat-message-system {
    font-style: italic;
    text-align: center;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .chat-message-options {
    position: absolute;
    top: -4px;
    right: 0px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    background-color: transparent;
  }
  .chat-message-options:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
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

  .message-container {
    padding-right: 12px;
  }

  mark {
    background-color:darken($dark-blue, 5%) !important;
    color:#c0dce7;
    position:relative;
  }
  mark:hover {
    color:white;
    cursor: pointer;
  }

  .screenshot {
    width:80%;
    max-width:500px;
  }
  .cursive {
    font-family: cursive;
  }
  .serif {
    font-family: serif;
  }
  .highlight {
    background-color: yellow;
    color: black;
  }
  blockquote {
    display: inline;
    border-left: 5px solid gray;
    padding-left: 2px;
    quotes: "“" "”" "‘" "’";
  }
  blockquote:before {
    margin-left:2px;
    content: open-quote;
  }
  blockquote:after {
    content: close-quote;
  }
  .notice {
    font-style: italic;
  }
</style>
