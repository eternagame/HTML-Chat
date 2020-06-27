<template>
  <Button
    class="chat-select"
    :class="{active: isActive}"
    @click="$emit('input');"
  >
    <p class='channel-name'>{{ name }}</p>
    <p class='channel-description'>{{ description }}</p>
    <button class="channel-close" @click="close" v-show="joined">X</button>
    <slot />
  </Button>
</template>

<script lang="ts">
  import {
    Component, Prop, Vue, Watch,
  } from 'vue-property-decorator';
  import chat from '@/store/chat.vuex';
  import SlideoutChats from './SlideoutChats.vue';


  @Component
  export default class ChatSelectButton extends Vue {
    @Prop()
    name!: string;

    @Prop()
    description!: string;

    get isActive() {
      return this.$vxm.chat.chatChannel.includes(this.name);
    }

    close(e: Event) {
      e.stopImmediatePropagation();
      Vue.delete(this.$vxm.chat.channels, this.name);
      let joined: string[] = JSON.parse(localStorage.joinedChannels || this.name);
      joined = joined.filter(i => i !== this.name);
      localStorage.joinedChannels = JSON.stringify(joined);
    }

    get joined() {
      return JSON.parse(localStorage.joinedChannels || '').includes(this.name);
    }
  }
</script>


<style lang="scss" scoped>
  /* Style the buttons that are used to open the tab content */
  .chat-select {
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    padding: 0.4em 1.25em;
    font-family: "Open Sans","Century Gothic", "Didact Gothic", Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    background-color: black;
    text-transform: none;
    display:block;
    width: 100%;
    height:90px;
    margin:0px;
    position: relative;
  }

  /* Change background color of buttons on hover */
  button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.13);
  }

  button.active {
    border-left: solid #4A90E2 10px; //Selected rectangle to the side is just left border
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    padding-left:5px;
  }

  .channel-name { /* Name of chat channel */
    margin-top:2px;
    font-size: 20px;
    text-align: justify;
    margin-left:5px;
    margin-bottom:10px;
  }

  .channel-description { /* Description of chat channel */
    font-size: 12px;
    text-align:justify;
    margin-left:5px;
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
</style>
