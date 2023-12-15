<template>
  <button
    class="chat-select border-0 font-weight-bold text-white d-block w-100"
    :class="{active: isActive}"
    @click="$emit('input');"
    :aria-label="`Open ${name.substring(1)}`"
  >
    <p class='channel-name text-justify ml-1 mb-2'>{{ name }}</p>
    <p class='channel-description text-justify ml-1'>{{ description }}</p>
    <button class="channel-close" @click="close" v-show="joined">X</button>
    <slot />
  </button>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import chat from '@/store/chat.vuex';
  import SlideoutChats from './SlideoutChats.vue';


  @Component
  export default class ChatSelectButton extends Vue {
    @Prop({ required: true })
    name !: string;

    @Prop({ required: true })
    description !: string;

    get isActive() {
      return this.$vxm.chat.chatChannel.includes(this.name);
    }

    close(e: Event) {
      e.stopImmediatePropagation();
      this.$vxm.chat.leaveChannel(this.name);
    }

    get joined() {
      let joined = [];
      if (localStorage.chat_joinedChannels) {
        joined = JSON.parse(localStorage.chat_joinedChannels);
      }
      return joined.includes(this.name);
    }
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  .chat-select {
    cursor: pointer;
    padding: 0.4em 1.25em;
    font-family: "Open Sans","Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    background-color: black;
    height:90px;
    position: relative;
    transition: all 0.2s !important;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active{
    border-left: solid #4A90E2 10px !important; //Selected rectangle to the side is just left border
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    padding-left: 5px;
  }

  .channel-name { /* Name of chat channel */
    margin-top:2px;
    font-size: 20px;
  }

  .channel-description { /* Description of chat channel */
    font-size: 12px;
  }
  .notified { /* Text color when notified */
    color:#e74c3c;
  }

  .mentioned {
    color:orange !important; /* Overrides notification styles */
  }

  .chat-select:hover > .channel-close {
    background-color: #e74c3c;
    color: white;
    position: absolute;
    right: 25px;
    border: none;
    height: 100%;
    top: -1px;
    width: 20px;
    display: inline-block;
    font-weight: bold;
    font-size: 20px;
  }

  .channel-close {
    display: none;
  }

  .chat-select:after {
    content: "";
    display: block;
    margin: 0 auto;
    width: 100%;
    height: 2px;
    border-bottom: 1px solid gray;
    bottom: calc(-0.4em - 1px);
    position: relative;
  }
</style>
