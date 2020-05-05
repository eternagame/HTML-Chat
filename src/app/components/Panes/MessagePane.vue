<template>
  <Pane ref="pane" :visibility="visibility" :data="data">
    <ul>
      <UserMessage
        v-for="(message, i) in data.postedMessages"
        :key="i"
        :message="message"
      />
      <ConnectingMessage />
    </ul>
    <template v-slot:footer>
      <ScalableInput
        v-model="newMessage"
        @keypress.native="onKeyPress"
        :disabled="!connectionData.connected || isBanned"
        @updateHeight="$nextTick($refs.pane.updateFooterHeight)"
        v-show="showInput && (!sizeSmall || !expansion)"
      />
      <SendButton v-on:click="sendMessage" v-show="showInput" v-model="button" />
      <ConnectButton
        v-show="!showInput"
      />
    </template>
  </Pane>
</template>

<script lang="ts">
  import {
    Component, Prop, Watch, Vue,
  } from 'vue-property-decorator';
  import { mapState } from 'vuex';
  import UserMessage from '../Messages/UserMessage.vue';
  import Pane from './Pane.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/ScalableInput.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import Message from '@/types/message';
  import { Channel } from '@/store/chat.vuex';
  import SendButton from '@/components/SendButton.vue';

  @Component({
    components: {
      ConnectingMessage,
      UserMessage,
      Pane,
      ScalableInput,
      ConnectButton,
      SendButton,
    },
  })
  export default class MessagesPane extends Vue {
    @Prop({ required: true })
    data!: Channel;

    @Prop({ required: true })
    visibility!: boolean;

    newMessage: string = '';

    get connectionData() {
      return this.$vxm.chat.connectionData;
    }

    get isBanned() {
      return this.data.banned !== BanStatus.BAN_STATUS_NORMAL;
    }

    get showInput() {
      return this.connectionData.connected
          || this.connectionData.firstConnection;
    }

    $refs!: {
      pane: Pane;
    };

    get messageSending() {
      return this.$vxm.chat.messageToBeSent;
    }

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$emit('postMessage', this.newMessage);
        this.newMessage = '';
        e.preventDefault();
      }
    }

    @Watch('messageSending')
    sendMessage() {
      if (this.messageSending) {
        this.$emit('postMessage', this.newMessage);
        this.newMessage = '';
        this.$vxm.chat.changeMessageToBeSent(false);
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
<style scoped>
.send-button {
  position:absolute;
  right:6px;
  bottom:6px;
  padding:0px;
  width:20px;
  height:20px;
}
</style>
