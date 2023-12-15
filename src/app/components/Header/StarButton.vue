<template>
  <button
    class="star-button border-0"
    style="float: right;"
    @click="$emit('input', !value);"
    :class="{ active: value}"
    aria-label="Show/hide starred messages"
   >
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';


  @Component
  export default class StarButton extends Vue {
    @Prop({ required: true })
    value !: boolean;
  }
</script>


<style lang="scss" scoped>
  .star-button {
    background-image: url("~@/assets/star-outline.png");
    background-repeat: no-repeat;
    background-size: 60% 60%;
    background-position: center;
    height: 35px;
    width: 35px;
    background-color: transparent;
    transition: all 0.4s;
  }
  .star-button:hover {
    cursor: pointer;
  }
  .star-button.active {
    background-image: url("~@/assets/star.png");
  }
</style>
