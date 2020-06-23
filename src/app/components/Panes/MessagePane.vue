<template>
  <Pane ref="pane" :visibility="visibility" :data="data" @autoscroll="this.autoscroll">
    <ul style="margin-bottom:0; padding-right:10px">
      <UserMessage
        v-for="(message, i) in data.postedMessages"
        :key="i"
        :message="message"
        :style="{fontSize:fontSize}"
      />
      <ConnectingMessage/>
      <UnreadMessageBanner v-show="unreads > 0" @click.native="scrollDown" :messages="unreads" />
    </ul>
    <template v-slot:footer>
      <EmoticonBar
        @emote="add"
        @md="format"
        @update="$nextTick($refs.pane.updateFooterHeight)"
        v-show="input"
        :inputValue="newMessage"
      >
      <template slot="input">
        <ScalableInput
          v-model="newMessage"
          id="input"
          @postMessage="send"
          @keypress.native="onKeyPress"
          :disabled="!connectionData.connected || isBanned"
          @updateHeight="$nextTick($refs.pane.updateFooterHeight)"
          ref="input"
          @focused="updateFocus"
        />
      </template>
      </EmoticonBar>
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
  import EmoticonBar from '@/components/Input/EmoticonBar.vue';
  import UserMessage from '../Messages/UserMessage.vue';
  import Pane from './Pane.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/Input/ScalableInput.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import Message from '@/types/message';
  import { Channel } from '@/store/chat.vuex';
  import UnreadMessageBanner from './UnreadMessageBanner.vue';

  @Component({
    components: {
      ConnectingMessage,
      UserMessage,
      Pane,
      ScalableInput,
      ConnectButton,
      EmoticonBar,
      UnreadMessageBanner,
    },
  })
  export default class MessagePane extends Vue {
    @Prop({ required: true })
    data!: Channel;

    get messages() {
      return this.data.postedMessages;
    }

    unreads = 0;

    @Watch('messages')
    messageAdded() {
      this.onContentChanged();
      if (!this.autoScroll) {
        this.unreads += 1;
      } else {
        this.unreads = 0;
      }
    }

    autoScroll = true;

    autoscroll(to:boolean) {
      this.autoScroll = to;
      if (to) {
        this.unreads = 0;
      }
    }

    @Prop({ required: true })
    visibility!: boolean;

    newMessage: string = '';

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

    // Updates font size
    get fontSize() {
      return `${this.$vxm.settings.fontSize.toString()}px`;
    }

    get anyChatFeatures() { // Checks if any chat features are enabled
      return (this.$vxm.settings.allChatFeatures
      || this.$vxm.settings.emoticonChatFeatures
      || this.$vxm.settings.markdownChatFeatures);
    }

    // Updates footer height when chat disappears/appears
    @Watch('anyChatFeatures')
    chatFeaturesChanged() {
      this.$nextTick(this.$refs.pane.updateFooterHeight);
      this.$refs.input.alone = this.anyChatFeatures;
    }

    get updateMessage() { // New value of input when up arrow is pressed
      return this.$vxm.chat.updateMessage;
    }

    get inputUpdate() { // Whether input should update to the above value
      return this.$vxm.chat.inputUpdate;
    }

    updateFocus(to:boolean) {
      this.focused = to;
    }

    focused = false;

    @Watch('inputUpdate') // Updates input when up arrow pressed
    update() {
      /* Makes sure new value is valid and input isn't focused
      We don't want a user to accidentally replace what they just typed */
      if (this.updateMessage.trim() !== '' && this.inputUpdate && !this.focused) {
        this.$refs.input.value = this.updateMessage;
        this.newMessage = this.updateMessage;
        this.$refs.input.$refs.textarea.value = this.updateMessage;
        this.$nextTick(() => { this.$vxm.chat.inputUpdate = false; });
      }
    }

    // For send button
    send() {
      this.$emit('postMessage', this.newMessage);
      this.newMessage = '';
      this.$refs.input.$refs.textarea.value = '';
      this.scrollDown();
    }

    format(options:string) {
      // Adds markdown formatting
      switch (options) {
        case 'bold': this.$refs.input.wrapOrInsert('**', true); break;
        case 'italics': this.$refs.input.wrapOrInsert('*', true); break;
        case 'italicsbold': this.$refs.input.wrapOrInsert('***', true); break;
        case 'strikethrough': this.$refs.input.wrapOrInsert('~~', true); break;
        case 'code': this.$refs.input.wrapOrInsert('`', true); break;
        case 'link': this.$refs.input.insertLink(); break;
        case 'action': this.$refs.input.insertString(0, '/me '); break;
        case 'quote': this.$refs.input.insertString(0, '> '); break;
        case 'question': this.$emit('postMessage', '/help'); break;
        default: break;
      }
    }

    add(emote:string) { // Inserts an emote at cursor position
      this.$refs.input.insertCharacter(emote, true);
      this.newMessage = this.$refs.input.value;
    }

    $refs!: {
      pane: Pane;
      input: ScalableInput;
    };

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.newMessage = this.$refs.input.value;
        this.$emit('postMessage', this.newMessage);
        this.$refs.input.$refs.textarea.value = '';
        this.$refs.input.value = '';
        this.newMessage = '';
        e.preventDefault();
        this.scrollDown();
      }
    }

    scrollDown() {
      this.$refs.pane.scrollDown();
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
</style>
