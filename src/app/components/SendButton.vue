<template>
  <button
    class="send-button"
    @click="sendMessage"
  >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class SendButton extends Vue {
    sendMessage() {
      this.$emit('input', this);
    }
  }
</script>

<style lang="scss" scoped>
  .send-button {
    background-color:rgba(0,0,0,0);
    border:none;
    background-image: url("../assets/send-button.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 30px;
    width: 25px;
  }
</style>
