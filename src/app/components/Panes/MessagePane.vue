<template>
  <Pane ref="pane" :visibility="visibility" :data="data">
    <ul>
      <UserMessage
        v-for="(message, i) in data.postedMessages"
        :key="i"
        :message="message"
        :style="{fontSize:fontSize}"
      />
      <ConnectingMessage/>
    </ul>
    <template v-slot:footer>
      <EmoticonBar @emote="add" @expanded="changeWrap" @md="format"/>
      <ScalableInput
        v-model="newMessage"
        id="input"
        @keypress.native="onKeyPress"
        :disabled="!connectionData.connected || isBanned"
        @updateHeight="$nextTick($refs.pane.updateFooterHeight)"
        ref="input"
      />
      <SendButton @send="send"/>
      <ConnectButton
        v-show="!input"
      />
    </template>
  </Pane>
</template>

<script lang="ts">
  import {
    Component, Prop, Watch, Vue,
  } from 'vue-property-decorator';
  import { mapState } from 'vuex';
  import EmoticonBar from '@/components/Emoticons/EmoticonBar.vue';
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
      EmoticonBar,
      SendButton,
    },
  })
  export default class MessagesPane extends Vue {
    @Prop({ required: true })
    data!: Channel;

    @Prop({ required: true })
    visibility!: boolean;

    newMessage: string = '';

    emoticonsOut: Boolean = false;

    get connectionData() {
      return this.$vxm.chat.connectionData;
    }

    get isBanned() {
      return this.data.banned !== BanStatus.BAN_STATUS_NORMAL;
    }

    get input() {
      return this.connectionData.connected
          || this.connectionData.firstConnection;
    }

    get showInput() {
      return this.input && !this.emoticonsOut;
    }

    // Updates font size
    get fontSize() {
      return `${this.$vxm.settings.fontSize.toString()}px`;
    }

    send() {
      this.$emit('postMessage', this.newMessage);
      this.newMessage = '';
      this.$refs.input.$refs.textarea.value = '';
    }

    format(options:string) {
      switch (options) {
        case 'B': this.$refs.input.wrapOrInsert('**', true); break;
        case 'I': this.$refs.input.wrapOrInsert('*', true); break;
        case 'S': this.$refs.input.wrapOrInsert('~~', true); break;
        case 'C': this.$refs.input.wrapOrInsert('`', true); break;
        case 'L': this.$refs.input.insertLink(); break;
        default: break;
      }
    }

    add(emote:string) {
      this.$refs.input.insertCharacter(emote, true);
      this.newMessage = this.$refs.input.value;
    }

    changeWrap(large:Boolean) {
      this.emoticonsOut = large;
    }

    $refs!: {
      pane: Pane;
      input: ScalableInput;
    };

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$emit('postMessage', this.newMessage);
        this.$refs.input.$refs.textarea.value = '';
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
<style scoped>
.send-button { /* Send message button */
  position: absolute;
  float:right;
  right:4px;
  width:29px;
  height:29px;
  bottom:3px;
}
</style>
