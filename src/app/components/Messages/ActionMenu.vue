<template>
  <VueContext ref="menu" class="action-menu-container" @open="opened">
    <li
      style="border-bottom: 1px solid white"
    >
      <a
        :href="profileUrl"
        target="_blank"
        style="color:white;"
      >
        {{ message && message.user ? message.user.username : '' }}
      </a>
    </li>
    <li>
      <button @click="openReportModal({report: true, ignore: false})">
        Report User / Message
      </button>
    </li>
    <li>
      <button @click="openReportModal({report: false, ignore: true})">
        Ignore User
      </button>
    </li>
    <li v-if="oper && !banned">
      <button @click="ban">
        Ban User
      </button>
    </li>
    <li v-if="oper && banned">
      <button @click="unban">
        Unban User
      </button>
    </li>
    <li v-if="oper">
      <button @click="kick">
        Kick User
      </button>
    </li>
    <li v-if="oper && !quieted">
      <button @click="quiet">
        Quiet User
      </button>
    </li>
    <li v-if="oper && quieted">
      <button @click="unquiet">
        Unquiet User
      </button>
    </li>
    <li>
      <button @click="privmsg">
        Private Message User
      </button>
    </li>
    <li>
      <button @click="copyMessage">
        Copy message
      </button>
    </li>
    <li v-if="!starred">
      <button @click.once="star">
        Star message
      </button>
    </li>
    <li v-if="starred">
      <button @click="unstar">
        Unstar message
      </button>
    </li>
  </VueContext>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import { VueContext } from 'vue-context';
  import Clipboard from '@cloudcmd/clipboard';
  import Message from '@/types/message';
  import User from '@/types/user';

  declare function writeText(text:string): void;

  @Component({
    components: {
      VueContext,
    },
  })
  export default class MessageActionsContextMenu extends Vue {
    $refs!: {
      menu: HTMLFormElement;
    };

    @Prop({ required: true })
    message!: Message;

    get user(): User {
      return this.message?.user;
    }

    ban() {
      this.$vxm.chat.ban(this.user);
    }

    quiet() {
      this.$vxm.chat.quiet(this.user);
    }

    kick() {
      this.$vxm.chat.kick(this.user);
    }

    unquiet() {
      this.$vxm.chat.unquiet(this.user);
    }

    unban() {
      this.$vxm.chat.unban(this.user);
    }

    privmsg() { // Opens up the private message modal
      if (!this.user || !this.user.username) return;
      this.$vxm.chat.userToPrivMsg = this.user.username;
    }

    star() {
      this.$vxm.chat.addStarredMessage(this.message);
      const localStars = [];
      if (localStorage.chat_stars) {
        localStars.push(...JSON.parse(localStorage.chat_stars) as Message[]);
      }
      localStars.push(this.message);
      localStorage.chat_stars = JSON.stringify(localStars);
    }

    unstar() {
      this.$vxm.chat.removeStar(this.message);
      let localStars = [];
      if (localStorage.chat_stars) {
        localStars.push(...JSON.parse(localStorage.chat_stars) as Message[]);
      }
      localStars = localStars.filter(e => e.message !== this.message.message
          && e.user !== this.message.user);
      localStorage.chat_stars = JSON.stringify(localStars);
    }

    get oper() {
      return this.$vxm.chat.oper;
    }

    get profileUrl(): string {
      if (!this.user) return '';
      return `http://${this.$vxm.chat.workbranch}/web/player/${this.user.uid}/`;
    }

    get starred() {
      return this.message.starred;
    }

    open(event: MouseEvent) {
      this.$refs.menu.open(event);
    }

    openReportModal(defaults: { report: boolean; ignore: boolean }) {
      this.$vxm.chat.openReportModal({ message: this.message, defaults });
    }

    userBanned() { // Gets user is banned; used to show/hide 'ban' and 'unban' buttons
      this.$vxm.chat.bans({
        user: this.message.user,
        channel: this.message.target,
        cb: (e) => {
          if (e) {
            this.banned = e;
          }
        },
      });
    }

    userQuieted() { // Gets user is quieted; used to show/hide 'quiet' and 'unquiet' buttons
      this.$vxm.chat.quiets({
        user: this.message.user,
        channel: this.message.target,
        cb: (e) => {
          if (e) {
            this.quieted = e;
          }
        },
      });
    }

    opened() { // Update ban and quiet status when menu is opened
      this.userBanned();
      this.userQuieted();
    }

    copyMessage() {
      if (!this.message || !this.message.user) return;
      const copyString = `<${this.message.user.username}>${this.message.message}`;
      Clipboard.writeText(copyString);
    }

    quieted = false;

    banned = false;
  }
</script>

<style scoped lang="scss">
@import "~@/assets/_custom.scss";
@import '~vue-context/src/sass/vue-context';
  li {
    color: white;
    padding:0px 5px;
  }

  li > a:focus, li > button:focus {
    background-color: transparent !important;
  }

  li:hover {
    background-color:$blue !important;
  }

  .action-menu-container {
    border-radius:5px;
    background-color:$med-dark-blue;
  }

  .action-menu-container:focus {
    outline:none;
  }

  li > a, li > button {
    cursor: pointer;
    color:white !important;
  }

  a:hover, button:hover {
    background: transparent !important;
  }

  button {
    border: none;
    background-color: transparent;
    display: inline;
  }
</style>
