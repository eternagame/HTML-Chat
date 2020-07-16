<template>
  <div class="link panel rounded p-2" v-if="openModal" tabindex=0>
    <p
    >
      This link goes to <a target="_blank" :href="url">{{url}}</a>.
    </p>
    <button
      aria-label="Click to travel to the link you clicked on"
      class="btn link-button btn-primary w-100 mt-2"
      style="left: 50%"
      @click="openModal = false"
    >
    <a :href="url" target="_blank">Continue</a>
    </button>
    <button
      aria-label="Click to return to the chat; this cancels opening the link"
      class="btn link-button btn-primary w-100 mt-2"
      style="left: 50%;"
      @click="openModal = false;"
    >
      Cancel
    </button>
  </div>
</template>

<script lang="ts">
  import {
    Component, Vue, Prop, Watch,
  } from 'vue-property-decorator';

  @Component
  export default class LinkModal extends Vue {
    url !: string;

    openModal: boolean = false;

    open(url: string) {
      this.openModal = true;
      this.url = url;
    }
  }
</script>

<style lang="scss">
  .link {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color:#043468;
    z-index:3;
  }

  .link-button > a:hover {
    text-decoration: none;
  }
  .link-button:focus {
    outline: 2px solid white;
  }
</style>
