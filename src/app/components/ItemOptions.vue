<template>
   <div style="overflow:hidden">
      <button
        class="chat-message-options border-0 text-white font-weight-bold"
        ref="chatOptions"
        aria-label="open message options"
        @click.prevent="openContextMenu"
        v-show="hovered && user.username"
        @blur="hovered = false"
        @keypress.enter.prevent="openContextMenuWithKey"
        tabindex=0
      >
        &vellip; <!-- ⋮ -->
      </button>
      <ActionMenu
        ref="contextMenu"
        :message="msg"
      />
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import ActionMenu from '@/components/Messages/ActionMenu.vue';
  import Message from '@/types/message';
  import User from '@/types/user';
  import Username from '@/components/Messages/Username.vue';

  @Component({
    components: {
      Username,
      ActionMenu,
    },
  })
  export default class ItemOptions extends Vue {
    @Prop({ required: true })
    user !: User;

    @Prop({ required: false })
    message !: Message;


    @Prop({ required: true })
    hover = false;

    @Watch('hover')
    updateData() {
      this.hovered = this.hover;
    }

    hovered = false;

    get msg() {
      if (this.message) return this.message;
      return new Message('Reporting user', '*', this.user);
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
    right: 5px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    background-color: transparent;
  }
  .chat-message-options:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
