<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <tab ref="tab">
    <ul>
      <MessageComponent
        v-for="(message, i) in messages"
        :key="i"
        :message="message"
      />
      <ConnectingMessage />
    </ul>
    <template v-slot:footer>
      <ScalableInput
        v-model="newMessage"
        @keypress="onKeyPress"
        :disabled="!connectionData.connected || isBanned"
        @updateHeight="$refs.tab.updateFooterHeight()"
        v-show="connectionData.connected ||
                connectionData.firstConnection"
      />
      <ConnectButton
        v-show="!connectionData.firstConnection &&
                !connectionData.connected"
      />
    </template>
  </tab>
</template>

<script lang="ts">
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '@/types/message';
  import { mapState } from 'vuex';
  import MessageComponent from '../Messages/IrcMessage.vue';
  import Tab from './Tab.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/ChatContent/ScalableInput.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import { State } from '@/store/state';

  @Component({
    components: {
      ConnectingMessage,
      MessageComponent,
      Tab,
      ScalableInput,
      ConnectButton,
    },
  })
  export default class MessagesTab extends Vue {
    @Prop()
    data!: { channel: string };

    newMessage: string = '';

    get messages() {
      return this.$store.state.postedMessages[this.data.channel];
    }

    get connectionData() {
      return this.$store.state.connectionData;
    }

    get isBanned() {
      return this.$store.state.banned[this.data.channel] !== BanStatus.BAN_STATUS_NORMAL;
    }

    $refs!: {
      tab: Tab;
      vueSimpleContextMenu: HTMLFormElement;
    };

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$store.dispatch('sendMessage', {
          message: this.newMessage,
          channel: this.data.channel,
        });
        this.newMessage = '';
        e.preventDefault();
      }
    }

    @Watch('messages')
    onContentChanged() {
      this.$refs.tab.onContentChanged();
    }

    @Watch('connectionData.connected')
    updateFooterHeight() {
      this.$nextTick(this.$refs.tab.updateFooterHeight);
    }
  }
</script>
