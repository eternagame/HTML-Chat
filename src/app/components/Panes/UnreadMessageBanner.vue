<template>
  <button class="btn unread-banner-container">
    {{messages}} new message{{messages === 1 ? 's' : ''}}
  </button>
</template>
<script lang="ts">
  import {
    Component, Prop, Vue,
  } from 'vue-property-decorator';

  @Component
  export default class UnreadMessageBanner extends Vue {
    @Prop({ required: true })
    messages !: number;
  }
</script>
<style lang="scss">
@import "../../assets/_custom.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
.unread-banner-container {
  width:90%;
  left:5%;
  margin-top: 2px;
  background-color:$green !important;
  border-radius:5px !important;
  position:sticky;
  bottom:0;
  text-align:center;
}
</style>
