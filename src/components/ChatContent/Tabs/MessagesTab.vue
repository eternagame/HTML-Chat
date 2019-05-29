<template>
  <tab ref="tab">
    <ul>
      <message-component
        v-for="(message, i) in $store.state.postedMessages[data.channel]"
        :key="i"
        :message="message"
        @menu-click="openMenu($event, message)"
      ></message-component>
      <connecting-message></connecting-message>
    </ul>
    <message-context-menu></message-context-menu>
    <template v-slot:footer>
    <chat-input ref="input" :channel="data.channel" @updateHeight="updateTextFeildHeight"></chat-input>
    </template>
  </tab>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator"
import Vue from '@/types/vue'
import VueSimpleContextMenu from "vue-simple-context-menu";
import MessageComponent from "../Messages/IrcMessage.vue";
import Tab from "./Tab.vue";
import ConnectingMessage from "../Connection/ConnectingMessage.vue";
import MessageContextMenu from "@/components/ChatContent/Messages/BlockMenu/MessageContextMenu.vue";
import ChatInput from "@/components/ChatContent/ChatInput.vue";
import { Message } from '../../../types/message';

@Component({
  components: {
    MessageContextMenu,
    ConnectingMessage,
    MessageComponent,
    Tab,
    VueSimpleContextMenu,
    ChatInput
  }
})
export default class MessagesTab extends Vue {
  @Prop()
  data!: { channel: string };

  $refs!: {
    tab: Tab;
    vueSimpleContextMenu: HTMLFormElement;
    input: ChatInput;
  };

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
    this.$store.subscribe((muatation, state) =>{
       if(muatation.type === 'setConnected')
        this.$refs.tab.onContentChanged()
    });
  }

  openMenu(event: any, message: Message) {
    this.$refs.vueSimpleContextMenu.showMenu(event, message);
  }

  updateTextFeildHeight({height}: {height:  number}){
    this.$refs.tab.updateFooterHeight(height);
  }
}
</script>
