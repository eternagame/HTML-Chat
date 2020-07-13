<template>
  <li
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <Username :user="user"
      @focus="hover = true" />
      <div style="overflow:hidden">
      <button
        class="chat-message-options"
        ref="chatOptions"
        @click.prevent="openContextMenu"
        v-show="hover && user.username"
        @blur="hover = false"
        @keypress.enter.prevent="openContextMenuWithKey"
        tabindex=0
      >
        &vellip; <!-- ⋮ -->
      </button>
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
    @Prop({ required: true })
    user !: User;

    hover = false;

    messageFrom(user:User) {
      return new Message('Reporting user ', '*', user);
    }

    $refs!: {
      contextMenu: HTMLFormElement;
      chatOptions: HTMLButtonElement;
    };

    openContextMenu(e: MouseEvent) {
      setTimeout(() => this.$refs.contextMenu.open(e));
    }

    openContextMenuWithKey(e: KeyboardEvent) {
      const rect = (e.target as Element).getBoundingClientRect();
      const event = new MouseEvent('click', {
        clientX: rect.x,
        clientY: rect.y,
      });
      setTimeout(() => this.$refs.contextMenu.open(event));
    }
  }
</script>
<style scoped>
  .chat-message-options {
    position: absolute;
    top: -4px;
    right:0px;
    font-size: 20px;
    display: block;
    cursor: pointer;
    overflow: visible;
    background-color: transparent;
    border: none;
  }
  .chat-message-options:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
  }
  li {
    position:relative;
    top:0;
    left:0;
  }
</style>
