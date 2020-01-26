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
