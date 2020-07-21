<template>
  <div class="message panel rounded p-2" tabindex="0">
    <span id="user" class="mb-2">To: {{username}}</span>
    <textarea
      type="text"
      id="msg"
      name="msg"
      class="form-control form-control-sm m-0 mw-100 mt-1 mb-1"
      ref="textArea"
      v-model="msg"
    />
    <button
      class="btn btn-primary w-100 mt-1"
      style="left: 50%"
      @click="send"
    >
      Continue
    </button>
    <button
      class="btn btn-primary w-100 mt-2"
      style="left: 50%"
      @click="cancel"
    >
      Cancel
    </button>
  </div>
</template>

<script lang="ts">
  /* Taken from OperLogin and modified */
  import { Component, Vue, Ref } from 'vue-property-decorator';
  import Message from '@/types/message';


  @Component({
    components: {},
  })
  export default class PrivateMessageModal extends Vue {
    msg = 'Message';

    get username() {
      return this.$vxm.chat.userToPrivMsg;
    }

    onStart() {
      this.$nextTick(() => this.textArea.focus());
      this.textArea.setSelectionRange(0, this.textArea.value.length);
    }

    @Ref() readonly textArea!: HTMLTextAreaElement;

    send() {
      this.$vxm.chat.postToQuery({ message: this.msg, channel: this.username });
      this.$vxm.chat.privMsgModal = false;
    }

    cancel() {
      this.$vxm.chat.privMsgModal = false;
    }
  }
</script>

<style lang="scss">
  @import "@/assets/_custom.scss";
  .message {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color:#043468;
    z-index:3;
  }

  #msg {
    min-height:24px;
  }

  button:focus {
    border: 2px solid white;
  }
</style>
