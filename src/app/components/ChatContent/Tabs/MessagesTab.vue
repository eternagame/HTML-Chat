<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <tab ref="tab">
    <ul>
      <Message
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
        v-show="showInput"
      />
      <ConnectButton
        v-show="!showInput"
      />
    </template>
  </tab>
</template>

<script lang="ts">
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import { mapState } from 'vuex';
  import Vue from '@/types/vue';
  import Message from '../Messages/IrcMessage.vue';
  import Tab from './Tab.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/ChatContent/ScalableInput.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import { State } from '@/store/state';

  @Component({
    components: {
      ConnectingMessage,
      Message,
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
      return this.$store.state.$_chat.postedMessages[this.data.channel];
    }

    get connectionData() {
      return this.$store.state.$_chat.connectionData;
    }

    get isBanned() {
      return this.$store.state.$_chat.banned[this.data.channel] !== BanStatus.BAN_STATUS_NORMAL;
    }

    get showInput() {
      return this.connectionData.connected
          || this.connectionData.firstConnection;
    }

    $refs!: {
      tab: Tab;
      vueSimpleContextMenu: HTMLFormElement;
    };

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$store.dispatch('$_chat/sendMessage', {
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
