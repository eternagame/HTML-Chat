<template>
  <vue-context ref="menu">
    <ul>
      <li
        @click="goToUserProfile"
        style="border-bottom: 1px solid black;"
      >{{ message ? message.user.username : ''}}
      </li>
      <li @click="openReportModal({report: true, ignore: false})">Report User / Message</li>
      <li @click="openReportModal({report: false, ignore: true})">Ignore User</li>
    </ul>
  </vue-context>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import { VueContext } from 'vue-context';
  import Message from '../../../../types/message';
  import User from '@/types/user';

  @Component({
    components: {
      VueContext,
    },
  })
  export default class MessageContextMenu extends Vue {
    $refs!: {
      menu: HTMLFormElement;
    };

    message: Message | null = null;

    open: boolean = false;

    get user(): User {
      return this.message!.user;
    }

    onCtxOpen() {
      this.open = true;
    }

    onCtxClose() {
      this.open = false;
    }

    created() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'openContextMenu') {
          this.$refs.menu.open(mutation.payload.event);
          this.message = mutation.payload.message;
        }
      });
    }

    goToUserProfile() {
      window.open(
        `http://${this.$store.state.workbranch}web/player/${this.user.uid}/`,
      );
    }

    openReportModal(defaults: { report: boolean; ignore: boolean }) {
      this.$store.commit('openReportModal', { message: this.message, defaults });
    }
  }
</script>

<style scoped lang="scss">
</style>
