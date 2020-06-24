<template>
  <div class="link panel" v-if="openModal" tabindex=0>
    <p
      tabindex=0
    >
      This link goes to <a target="_blank" :href="url">{{url}}</a>.
    </p>
    <button
      tabindex=0
      aria-label="Click to travel to the link you clicked on"
      class="btn link-button"
      style="width: 100%; left: 50%; margin-top:10px"
      @click="openModal = false"
    >
    <a :href="url" target="_blank">Continue</a>
    </button>
    <button
      tabindex=0
      aria-label="Click to return to the chat; this cancels opening the link"
      class="btn link-button"
      style="width: 100%; left: 50%; margin-top:10px;"
      @click="openModal = false;"
    >
      Cancel
    </button>
  </div>
</template>

<script lang="ts">
  import BootstrapVue from 'bootstrap-vue';
  import {
    Component, Vue, Prop, Watch,
  } from 'vue-property-decorator';

  Vue.use(BootstrapVue);

  @Component
  export default class LinkModal extends Vue {
    url !: string;

    openModal = false;
  }
</script>

<style lang="scss">
@import "../assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
  .link {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    background-color:#043468;
    border-radius:10px;
    z-index:3;
  }

  .link-button {
    color:white;
    background-color:$green !important;
  }

  .link-button > a:hover {
    text-decoration: none;
  }
  .link-button:focus {
    outline: 2px solid white;
  }
</style>
