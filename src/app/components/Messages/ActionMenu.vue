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
        {{ message ? message.user.username : '' }}
      </a>
    </li>
    <li>
      <a @click="openReportModal({report: true, ignore: false})">
        Report User / Message
      </a>
    </li>
    <li>
      <a @click="openReportModal({report: false, ignore: true})">
        Ignore User
      </a>
    </li>
    <li v-if="oper && !banned">
      <a @click="ban">
        Ban User
      </a>
    </li>
    <li v-if="oper && banned">
      <a @click="unban">
        Unban User
      </a>
    </li>
    <li v-if="oper">
      <a @click="kick">
        Kick User
      </a>
    </li>
    <li v-if="oper && !quieted">
      <a @click="quiet">
        Quiet User
      </a>
    </li>
    <li v-if="oper && quieted">
      <a @click="unquiet">
        Unquiet User
      </a>
    </li>
    <li>
      <a @click="privmsg">
        Private Message User
      </a>
    </li>
  </VueContext>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import { VueContext } from 'vue-context';
  import Message from '@/types/message';
  import User from '@/types/user';


  @Component({
    components: {
      VueContext,
    },
  })
  export default class MessageActionsContextMenu extends Vue {
    $refs!: {
      menu: HTMLFormElement;
    };

    @Prop()
    message!: Message;

    get user(): User {
      return this.message!.user;
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
      this.$vxm.chat.userToPrivMsg = this.user.username;
      this.$vxm.chat.privMsgModal = true;
    }

    get oper() {
      return this.$vxm.chat.oper;
    }

    get profileUrl(): string {
      return `http://${this.$vxm.chat.workbranch}/web/player/${this.user.uid}/`;
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

    quieted = false;

    banned = false;
  }
</script>

<style scoped lang="scss">
@import "../../assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import '~vue-context/src/sass/vue-context';
  li {
    color: white;
    padding:0px 5px;
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

  li > a {
    cursor: pointer;
    color:white !important;
  }

  a:hover {
    background: transparent !important;
  }
</style>
