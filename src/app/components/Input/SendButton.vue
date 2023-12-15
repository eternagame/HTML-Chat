<template>
  <button
    class="send-button border-0"
    :class="{animated: animationValue}"
    @click="sendMessage"
    aria-label="send"
  >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class SendButton extends Vue {
    animationValue = false;

    sendMessage() {
      this.animationValue = true;
      this.$emit('send');
    }
  }
</script>

<style lang="scss" scoped>
  .send-button {
    background-color:rgba(0,0,0,0);
    background-image: url("~@/assets/send-button.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 30px;
    width: 25px;
    transition: transform 0.5s;
  }
  .send-button:active {
    transform:translateX(3px);
  }
</style>
