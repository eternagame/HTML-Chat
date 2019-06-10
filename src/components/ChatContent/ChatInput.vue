<template>
  <div>
    <textarea
      :style="{height: `${height}px`}"
      class="chat-input"
      @keyup="onKeyUp"
      @input="onInput"
      v-model="message"
      v-show="$store.state.connectionData.connected || $store.state.connectionData.firstConnection"
      :disabled="!$store.state.connectionData.connected || !!$store.state.banned[channel]"
    ></textarea>
    <connect-button v-if="!$store.state.connectionData.firstConnection &&
                          !$store.state.connectionData.connected" class="connect-button">
    </connect-button>
    <div class="chat-input-hidden" ref="hiddenDiv">{{message}}</div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import { CHAT_CHANNEL } from '../../define-user';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';

  @Component({
    components: {
      ConnectButton,
    },
  })
  export default class ChatInput extends Vue {
    message = '';

    height = 19;

    @Prop()
    channel!: string;

    $refs!: {
      hiddenDiv: HTMLFormElement;
    };

    onInput(e: KeyboardEvent) {
      this.updateHeight();
    }

    onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$store.dispatch('sendMessage', {
          message: this.message,
          channel: this.channel,
        });
        this.message = '';
      }
      this.updateHeight();
    }

    updateHeight() {
      this.height = this.$refs.hiddenDiv.clientHeight;
      this.$emit('updateHeight', { height: this.height + 16 });
    }

    mounted() {
      this.updateHeight();
    }

    created() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'changeTab') {
          this.$nextTick(() => {
            this.updateHeight();
          });
        }
      });
    }
  }
</script>

<style scoped lang="scss">
  /************* Chat input *************/
  .chat-input {
    resize: none;
    overflow: hidden;
  }

  .chat-input,
  .chat-input-hidden,
  .connect-button {
    width: calc(100% - 22px);
    margin: 5px 10px;
    min-height: 19px;
  }

  /* To determine input size */
  .chat-input-hidden {
    position: absolute;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    min-height: 19px;
    border: 1px solid;
  }

  .connect-button {
    position: absolute;
    bottom: 9px;
  }
</style>
