<template>
  <li
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <Username :user="user"
      @focus="hover = true"
    />
    <ItemOptions :user="user" :hover="hover" />
  </li>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import ActionMenu from '@/components/Messages/ActionMenu.vue';
  import Message from '@/types/message';
  import User from '@/types/user';
  import Username from '@/components/Messages/Username.vue';
  import ItemOptions from '@/components/ItemOptions.vue';

  @Component({
    components: {
      Username,
      ActionMenu,
      ItemOptions,
    },
  })
  export default class SlideoutUsername extends Vue {
    @Prop({ required: true })
    user !: User;

    hover = false;
  }
</script>
<style scoped>
  li {
    position:relative;
    top:0;
    left:0;
  }
</style>
