<template>
  <Pane ref="pane" :visibility="visibility" :data="data">
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
        @updateHeight="$nextTick($refs.pane.updateFooterHeight)"
        v-show="showInput"
      />
      <ConnectButton
        v-show="!showInput"
      />
    </template>
  </Pane>
</template>

<script lang="ts">
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import { mapState } from 'vuex';
  import Vue from '@/types/vue';
  import Message from '../Messages/IrcMessage.vue';
  import Pane from './Pane.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/ChatContent/ScalableInput.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import { State } from '@/store/state';

  @Component({
    components: {
      ConnectingMessage,
      Message,
      Pane,
      ScalableInput,
      ConnectButton,
    },
  })
  export default class MessagesPane extends Vue {
    @Prop()
    data!: { channel: string };

    @Prop({ required: true })
    visibility!: boolean;

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
      pane: Pane;
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
      this.$refs.pane.onContentChanged();
    }

    @Watch('connectionData.connected')
    updateFooterHeight() {
      this.$nextTick(this.$refs.pane.updateFooterHeight);
    }
  }
</script>
