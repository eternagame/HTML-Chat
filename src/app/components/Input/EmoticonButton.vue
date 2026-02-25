<template>
  <button
    type="button"
    class='emoticon-button emoticon-button-container text-white border-left-0 border-top-0 text-center float-left'
    @click="clicked"
  >
    <span class='align-middle h-100 emoticon-text-container'>{{emoticon}}</span>
  </button>
</template>
<script lang='ts' setup>
const props = defineProps({
  emoticon: {
    type: String,
    required: true,
  },
});
const emit = defineEmits<{
  (event: 'emote', emoticon: string): void
}>();

function clicked() {
  emit('emote', props.emoticon);
}
</script>
<style scoped>
  .emoticon-button {
    background-color:#043468;
    position: relative;
    width:30px;
    height:25px;
    border: none;
  }
  .emoticon-button-container:hover {
    background-color: #21508c;
  }
  .emoticon-text-container {
    font-size:14px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
