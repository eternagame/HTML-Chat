<template>
  <div class="message panel">
    <div class="trans-panel rounded-10">
      <form>
        <div id="user">To: {{username}}</div>
        <textarea type="text" id="msg" name="msg" ref="ta" v-model="msg"/>
        <div
          class="green-button"
          style="width: 90%; left: 50%; transform: translateX(-50%); margin-top:10px"
          @click="send"
        >
        Continue
        </div>
        <div
          class="green-button"
          style="width: 90%; left: 50%; transform: translateX(-50%); margin-top:10px;"
          @click="cancel"
        >
          Cancel
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
  /* Taken from OperLogin and modified */
  import { Component, Vue } from 'vue-property-decorator';
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
      this.$nextTick(() => this.$refs.ta.focus());
      this.$refs.ta.setSelectionRange(0, this.$refs.ta.value.length);
    }

    $refs !: {
      ta: HTMLTextAreaElement,
    };

    send() {
      console.log(`Sending message ${this.msg} to username ${this.username} from modal`);
      Array.from(new Set(this.$vxm.chat.connectedUsers[this.username]?.nicks)).forEach(n => {
        console.log(`Posting message ${this.msg} to nick ${n} to query`);
        this.$vxm.chat.postToQuery(`${n}|${this.msg}`);
      });
      this.$vxm.chat.privMsgModal = false;
    }

    cancel() {
      this.$vxm.chat.privMsgModal = false;
    }
  }
</script>

<style lang="scss">
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

  .blue-button,
  .green-button {
    padding: 4px 7px !important;
  }
</style>
