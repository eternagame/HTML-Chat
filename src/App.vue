<template>
  <div id="app1" style="height:100%; overflow-y:hidden;">
    <div class="chat" style="height: 100%;">
      <tabs-panel></tabs-panel>
      <chat-content></chat-content>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import TabsPanel from './components/TabsPanel/TabsPanel.vue';
  import ChatContent from './components/ChatContent/ChatContent.vue';
  @Component({
    components: {
      TabsPanel,
      ChatContent,
    },
  })
  export default class App extends Vue {
    mounted() {
      this.$store.dispatch('initClient');
    }
  }
</script>

<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Didact+Gothic|Open+Sans:400,300,600,700);
@import url(https://irc.eternagame.org/eterna.css);
textarea {
  border-radius: 2px;
  font-family: "Open Sans", "Helvetica Neue", Arial, Gulim;
  font-size: 0.85rem;
  border: 1px solid rgb(169, 169, 169);
  width: calc(100% - 10px);
}

// #chat-input,
// #reconnect {
//   position: absolute;
//   bottom: 0px;
//   width: calc(100% - 28px);
//   height: 19px;
//   resize: none;
//   margin: 10px;
// }
</style>

<style scoped lang="scss">
.chat {
  font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
}
</style>
