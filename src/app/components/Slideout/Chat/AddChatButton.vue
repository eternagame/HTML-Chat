<template>
  <div class="add-chat-container">
    <button @click="addChat">+</button>
    <span class="input-container">
      #<input
        @keypress.enter="addChat(); chatName = ''"
        v-model="chatName"
        aria-label="Add a channel"
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
  @import "../../../assets/_custom.scss";
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
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
    background-color: $green;
    text-align: center;
    padding-top:2px;
    font-size: 18px;
    border: none;
    color: white;
    display: inline-block;
    border-radius: 4px;
    margin-right: 10px;
  }
  .input-container {
    height: 30px;
    width: calc(100% - 40px);
    display: inline-block;
    font-size: 20px;
    vertical-align: baseline;
  }
  input {
    width: calc(100% - 1rem - 2px);
    float: right;
    height: 100%;
    padding-bottom: 2px;
  }
</style>
