<template>
  <button
    class="send-button"
    :class="{animated: animationValue}"
    @click="sendMessage"
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
    border:none;
    background-image: url("../../assets/send-button.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 30px;
    width: 25px;
    transition: transform 0.5s;
    margin:0;
  }
  .send-button:active {
    transform:translateX(3px);
  }
</style>
