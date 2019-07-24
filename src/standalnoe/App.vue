<template>
  <div
    id="app1"
    style="height:100%; overflow-y:hidden;"
  >
    <chat-app></chat-app>
  </div>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator';
  import Vue from 'vue';
  import ChatApp from '../app/App.vue';

  @Component({
    components: {
      ChatApp,
    },
  })
  export default class App extends Vue {
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

.chat {
  font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
}
</style>
