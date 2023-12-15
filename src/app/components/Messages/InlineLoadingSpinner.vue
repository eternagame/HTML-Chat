<template functional>
  <img
    src="https://s3.amazonaws.com/eterna/icon_img/loading.gif"
    class="d-inline"
    style="height: 1rem"
  >
</template>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  @Component
  export default class InlineLoadingSpinner extends Vue {}
</script>
