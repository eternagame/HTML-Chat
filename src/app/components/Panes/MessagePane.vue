<template>
  <Pane ref="pane" :visibility="visibility" :data="data" @autoscroll="this.autoscroll">
    <ul style="margin-bottom:0;" class="list-group list-style-type-none">
      <span
        v-for="(message, i) in groupedMessages"
        :key="i"
        :style="{fontSize:fontSize}"
      >
        <UserMessage
          v-show="message.user"
          :display="message.user"
          :message="message"
        />
        <MessageGroup v-show="!message.user" :messages="message" />
      </span>
      <ConnectingMessage/>
      <UnreadMessageBanner v-show="unreads > 0" @click.native="scrollDown" :messages="unreads" />
    </ul>
    <template v-slot:footer>
      <div
        class='typing'
        v-if="$vxm.settings.typingMessages"
        v-show="anyTyping">
        {{typingString}}
      </div>
      <EmoticonBar
        @emote="add"
        @md="format"
        @update="$nextTick($refs.pane.updateFooterHeight)"
        v-show="input"
        :inputValue="newMessage"
        :selection="selection"
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
          @select="selection = $event"
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
  import MessageGroup from '../Messages/MessageGroup.vue';
  import Pane from './Pane.vue';
  import ConnectingMessage from '../Connection/ConnectingMessage.vue';
  import ScalableInput from '@/components/Input/ScalableInput.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import Message from '@/types/message';
  import { Channel } from '@/store/chat.vuex';
  import UnreadMessageBanner from './UnreadMessageBanner.vue';
  import User from '@/types/user';

  @Component({
    components: {
      ConnectingMessage,
      UserMessage,
      Pane,
      ScalableInput,
      ConnectButton,
      EmoticonBar,
      UnreadMessageBanner,
      MessageGroup,
    },
  })
  export default class MessagePane extends Vue {
    @Prop({ required: true })
    data!: Channel;

    get messages() {
      return this.data.postedMessages;
    }

    get displayedMessages() {
      if (this.$vxm.chat.showStarred) {
        return this.messages.filter(e => e.starred);
      }
      return this.messages;
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

    get groupedMessages() {
      const msgs = this.displayedMessages;
      // Creates and array of Message arrays and Messages. Messages by the same user
      // are grouped together in one array. Other, non-grouped messages are in the main array
      const temp: any = [];
      msgs.forEach(e => {
        const len = temp.length - 1;
        // If it's the first message, add it
        if (len < 0) {
          temp.push(e);
          return;
        }
        const last = temp[len];
        // If the last message was by the same user and it was not in a grouped array
        if (last.user && last.user.username === e.user.username) {
          // Make the previous entry a grouped array of the old message and the current one
          temp[len] = [last, e];
        } else if (last[last.length - 1] // If the last entry was a grouped array
          // And the grouped messages are by the same user as the current one
          && last[last.length - 1].user.username === e.user.username) {
          // Add the current message to the grouped array
          temp[len].push(e);
        } else {
          // Otherwise, just add it to the temp array
          temp.push(e);
        }
      });
      return temp;
    }

    autoScroll = true;

    autoscroll(to:boolean) {
      this.autoScroll = to;
      if (to) {
        this.unreads = 0;
      }
    }

    get typing() {
      return this.data.typing;
    }

    get anyTyping() {
      if (!this.typing) return false;
      return this.typing.length > 0;
    }

    get username() {
      return this.$vxm.chat.username;
    }

    get typingString() {
      if (!this.typing) return '';
      const users = this.typing.slice();
      const plural = users.length > 1;
      if (this.username !== '') {
        const nameIndex = users.indexOf(this.username);
        if (nameIndex !== -1) {
          users[nameIndex] = 'You';
        }
      }
      if (plural) {
        const lastUser = users.pop();
        return `${users.join(', ')}${users.length > 1 ? ',' : ''} and ${lastUser} are typing...`;
      }
      return `${users[0]} ${users[0] === 'You' ? 'are' : 'is'} typing...`;
    }

    selection: number[] = [];

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
      return (this.$vxm.settings.emoticonChatFeatures
      || this.$vxm.settings.markdownChatFeatures
      || this.$vxm.settings.previewChatFeatures);
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
      this.$vxm.chat.stopTyping(this.data.name);
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
        case 'cursive': this.$refs.input.wrapOrInsert('::', true); break;
        case 'serif': this.$refs.input.wrapOrInsert(':', true); break;
        case 'highlight': this.$refs.input.wrapOrInsert('|', true); break;
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
        this.$vxm.chat.stopTyping(this.data.name);
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
.typing {
  font-style: italic;
  font-weight: bold;
}
</style>
