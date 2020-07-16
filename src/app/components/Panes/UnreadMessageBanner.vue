<template>
  <button class="btn unread-banner-container rounded w-100 p-1 btn-primary">
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
  position:sticky;
  bottom:0;
}
</style>
