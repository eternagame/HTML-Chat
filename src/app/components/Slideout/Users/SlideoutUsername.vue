<template>
  <li
    @mouseover="hover = true"
    @focusin="hover = true"
    @mouseleave="hover = false"
    @focusout="hover = true"
  >
    <Username :user="user" />
    <ItemOptions :user="user" :hover="hover" />
  </li>
</template>
<script lang="ts">
import {
  Vue, Component, Prop,
} from 'vue-property-decorator';
import ActionMenu from '@/components/Messages/ActionMenu.vue';
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
  @Prop({ required: true }) user!: User;

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
