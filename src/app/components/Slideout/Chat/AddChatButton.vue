<template>
  <div class="add-chat-container">
    <button
      @click="addChat"
      class='btn btn-primary text-center border-0 rounded mt-0 p-0 d-inline-block align-top'
    >+</button>
    <span class="input-container d-inline-block align-baseline">
      #<input
        @keypress.enter="addChat(); chatName = ''"
        class='h-100 float-right'
        v-model="chatName"
        aria-label="Add channel"
    ></span>
  </div>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import chat, { Channel } from '@/store/chat.vuex';
  import SlideoutChats from './SlideoutChats.vue';
  import BanStatus from '../../../types/BanStatus';


  @Component
  export default class AddChatButton extends Vue {
    chatName: string = '';

    addChat() {
      const name = `#${this.chatName.replace('#', '')}`;
      this.$vxm.chat.joinChannel(name);
      this.$nextTick(() => {
        this.$parent.$el.scrollTop = this.$parent.$el.scrollHeight;
      });
    }
  }
</script>


<style lang="scss" scoped>
  @import "~@/assets/_custom.scss";
  /* Style the buttons that are used to open the tab content */
  .add-chat-container {
    transition: 0.3s;
    padding: 0.4em 1.25em;
    font-size: 12px;
    color: #fff;
    background-color: black;
    width: 100%;
    position: relative;
  }
  button {
    height: 30px;
    width: 30px;
    padding-top: 2px;
    margin-right: 10px;
    font-size: 18px;
  }
  .input-container {
    height: 30px;
    width: calc(100% - 40px);
    font-size: 20px;
  }
  input {
    width: calc(100% - 1rem - 2px);
    padding-bottom: 2px;
  }
</style>
