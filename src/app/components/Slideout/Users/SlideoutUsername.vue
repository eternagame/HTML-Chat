<template>
  <li
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <Username :user="user" />
      <div style="overflow:hidden">
      <a
        class="chat-message-options"
        @click.prevent="openContextMenu"
        v-show="hover && user.username"
      >
        &vellip; <!-- ⋮ -->
      </a>
      <ActionMenu
        ref="contextMenu"
        :message="messageFrom(user)"
      />
    </div>
  </li>
</template>
<script lang="ts">
  /* This is essentially a duplicate of UserMessage, just with the message removed */
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import ActionMenu from '../../Messages/ActionMenu.vue';
  import Message from '@/types/message';
  import User from '@/types/user';
  import Username from '../../Messages/Username.vue';

  @Component({
    components: {
      Username,
      ActionMenu,
    },
  })
  export default class SlideoutUsername extends Vue {
    @Prop()
    user !: User;

    hover = false;

    messageFrom(user:User) {
      return new Message('Reporting user ', '*', user);
    }

    $refs!: {
      contextMenu: HTMLFormElement;
    };

    openContextMenu(e: MouseEvent) {
      setTimeout(() => this.$refs.contextMenu.open(e));
    }
  }
</script>
<style scoped>
  .chat-message-options {
    user-select: none;
    position: absolute;
    top: -4px;
    right:0px;
    font-size: 20px;
    display: block;
    cursor: pointer;
    overflow: visible;
  }
  li {
    position:relative;
    top:0;
    left:0;
  }
</style>
