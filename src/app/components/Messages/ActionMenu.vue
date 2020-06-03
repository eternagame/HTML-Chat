<template>
  <VueContext ref="menu" style="padding: 0;">
    <li>
      <a
        :href="profileUrl"
        target="_blank"
        style="border-bottom: 1px solid black;"
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
    <li v-if="oper">
      <a @click="ban">
        Ban User
      </a>
    </li>
    <li v-if="oper">
      <a @click="unban">
        Unban User
      </a>
    </li>
    <li v-if="oper">
      <a @click="kick">
        Kick User
      </a>
    </li>
    <li v-if="oper">
      <a @click="quiet">
        Quiet User
      </a>
    </li>
    <li v-if="oper">
      <a @click="unquiet">
        Unquiet User
      </a>
    </li>
  </VueContext>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
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
  }
</script>

<style scoped lang="scss">
  li {
    color: black;
  }

  a {
    cursor: pointer;
  }
</style>
