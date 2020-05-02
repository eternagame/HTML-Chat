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
        v-bind:class="{'smaller': expansion && !sizeSmall,
        'bigger': !expansion && sizeSmall,
        'biggest': !expansion && !sizeSmall}"
      />
      <EmoticonButton
        emoticon='😀'
        position=2
        v-show="showInput && !sizeSmall"
      />
      <EmoticonButton
        emoticon='👍'
        position=3
        v-show="showInput && !sizeSmall"
      />
      <ExpandButton />
      <EmoticonButton
        emoticon='👎'
        position=4
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😢'
        position=5
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😠'
        position=6
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😀'
        position=3
        v-show="showInput && expansion && sizeSmall"
         v-if="expansion"
      />
      <EmoticonButton
        emoticon='👍'
        position=2
        v-show="showInput && expansion && sizeSmall"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😮'
        position=7
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😮'
        position=8
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😂'
        position=9
        v-show="showInput"
        v-if="expansion"
      />
      <EmoticonButton
        emoticon='😎'
        position=10
        v-show="showInput"
        v-if="expansion"
      />
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
  import EmoticonButton from '@/components/EmoticonButton.vue';
  import ExpandButton from '@/components/ExpandButton.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  import BanStatus from '@/types/BanStatus';
  import Message from '@/types/message';
  import { Channel } from '@/store/chat.vuex';

  @Component({
    components: {
      ConnectingMessage,
      UserMessage,
      Pane,
      ScalableInput,
      EmoticonButton,
      ExpandButton,
      ConnectButton,
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

    get strsNeed() {
      return this.$vxm.chat.stringToAdd;
    }

    get expansion() {
      return this.$vxm.chat.expandedButtons;
    }

    get sizeSmall() {
      const val = (window.innerWidth < 300);
      this.$vxm.chat.changeScreenSmall(val);
      return (window.innerWidth < 300);
    }

    $refs!: {
      pane: Pane;
    };

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$emit('postMessage', this.newMessage);
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

    @Watch('strsNeed')
    newStrs() {
      this.newMessage += this.strsNeed;
      this.$vxm.chat.clearString();
    }
  }
</script>
