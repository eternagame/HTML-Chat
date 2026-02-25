<template>
  <button
    type="button"
    class="send-button border-0"
    @click="sendMessage"
    aria-label="Send"
  />
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (event: 'send'): void;
}>();

function sendMessage() {
  emit('send');
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
