<template>
  <div class="link panel rounded p-2" v-if="openModal" tabindex=0>
    <span>
      This link goes to <a target="_blank" rel="noopener noreferrer" :href="url">{{url}}</a>.
    </span>
    <button
      type="button"
      class="btn link-button btn-primary w-100 mt-2 text-white"
      style="left: 50%"
      @click="openModal = false"
    >
      <a :href="url" target="_blank" rel="noopener noreferrer">Continue</a>
    </button>
    <span class="text-muted">Travel to the link you clicked on</span>
    <button
      type="button"
      class="btn link-button btn-primary w-100 mt-2"
      style="left: 50%;"
      @click="openModal = false;"
    >
      Cancel
    </button>
    <span class="text-muted">Do not travel to the link you clicked on</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const openModal = ref<boolean>(false);
const url = ref<string>();

defineExpose({
  open(externalUrl: string) {
    openModal.value = true;
    url.value = externalUrl;
  },
});
</script>

<style lang="scss" scoped>
  .link {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color:#043468;
    z-index:3;
    max-width: 30%;
    zoom: 1.02; // Fixes anti-aliasing caused by translation
  }

  .link-button > a:hover {
    text-decoration: none;
  }
  .link-button:focus {
    outline: 2px solid white;
  }

  .link > span {
    width: auto
  }
</style>
