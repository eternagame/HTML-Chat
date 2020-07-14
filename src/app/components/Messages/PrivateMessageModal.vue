<template>
  <div class="message panel" tabindex="0">
    <span id="user">To: {{username}}</span>
    <textarea type="text" id="msg" name="msg" ref="textArea" v-model="msg"/>
    <button
      class="btn btn-primary"
      style="width: 100%; left: 50%; margin-top:5px"
      @click="send"
    >
      Continue
    </button>
    <button
      class="btn btn-primary"
      style="width: 100%; left: 50%; margin-top:10px;"
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
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  .message {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    background-color:#043468;
    border-radius:10px;
    z-index:3;
  }

  #msg {
    min-width:150px;
    min-height:24px;
    margin:5px;
  }

  #user {
    margin-bottom:5px;
  }

  .btn {
    background-color: $green;
  }

  button:focus {
    border: 2px solid white;
  }
</style>
