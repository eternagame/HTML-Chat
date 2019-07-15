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
      <ChatInput
        :channel="data.channel"
        @updateHeight="$refs.tab.updateFooterHeight($event)"
        v-show="$store.state.connectionData.connected ||
                $store.state.connectionData.firstConnection"
      />
      <ConnectButton
        @updateHeight="$refs.tab.updateFooterHeight($event)"
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
  import ChatInput from '@/components/ChatContent/ChatInput.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';

  @Component({
    components: {
      ConnectingMessage,
      MessageComponent,
      Tab,
      ChatInput,
      ConnectButton,
    },
  })
  export default class MessagesTab extends Vue {
    @Prop()
    data!: { channel: string };

    $refs!: {
      tab: Tab;
      vueSimpleContextMenu: HTMLFormElement;
    };


    mounted() {
      console.log(this.$refs.tab);
    }

    created() {
      console.log(this.$refs.tab);
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
    }
  }
</script>
