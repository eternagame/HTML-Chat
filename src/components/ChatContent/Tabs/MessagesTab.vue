<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <tab ref="tab">
    <ul>
      <MessageComponent
        v-for="(message, i) in $store.state.postedMessages[data.channel]"
        :key="i"
        :message="message"
      />
      <ConnectingMessage />
    </ul>
    <template v-slot:footer>
      <ScalableInput
        v-model="newMessage"
        @keypress="onKeyPress"
        :disabled="!$store.state.connectionData.connected || isBanned"
        @updateHeight="$refs.tab.updateFooterHeight()"
        v-show="$store.state.connectionData.connected ||
                $store.state.connectionData.firstConnection"
      />
      <ConnectButton
        v-show="!$store.state.connectionData.firstConnection &&
                !$store.state.connectionData.connected"
      />
    </template>
  </tab>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Message from '@/types/message';
  import MessageComponent from '../Messages/IrcMessage.vue';
  import Tab from './Tab.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/ChatContent/ScalableInput.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';
  import { consts } from '@/types/consts';

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

    $refs!: {
      tab: Tab;
      vueSimpleContextMenu: HTMLFormElement;
    };

    get isBanned() {
      return this.$store.state.banned[this.data.channel] !== consts.BAN_STATUS_NORMAL;
    }

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

    created() {
      this.$store.subscribe((mutation, state) => {
        if (
          mutation.type === 'postMessage'
        ) {
          if (mutation.payload.message.target === this.data.channel || mutation.payload.message.target === '*') {
            this.$refs.tab.onContentChanged();
          }
        }
      });
      this.$store.subscribe((muatation, state) => {
        if (muatation.type === 'setConnected') this.$refs.tab.onContentChanged();
      });
      this.$store.watch(state => state.connectionData.connected,
                       () => this.$nextTick(this.$refs.tab.updateFooterHeight));
    }
  }
</script>
