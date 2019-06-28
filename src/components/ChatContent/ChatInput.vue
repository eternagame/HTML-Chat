<template>
  <div>
    <textarea
      v-show="$store.state.connectionData.connected || $store.state.connectionData.firstConnection"
      v-model="message"
      :style="{height: `${height}px`}"
      class="chat-input"
      :disabled="!$store.state.connectionData.connected || isBanned"
      @input="updateHeight"
      @keypress="onKeyPress"
      @keyup="updateHeight"
    />
    <ConnectButton
      v-if="!$store.state.connectionData.firstConnection &&
        !$store.state.connectionData.connected"
      class="connect-button"
    />
    <div
      ref="hiddenDiv"
      class="chat-input-hidden"
    >{{ message }}</div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import { consts } from '@/types/consts';
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

    get isBanned() {
      return this.$store.state.banned[this.channel] !== consts.BAN_STATUS_NORMAL;
    }

    onKeyPress(e: KeyboardEvent) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.$store.dispatch('sendMessage', {
          message: this.message,
          channel: this.channel,
        });
        this.message = '';
        e.preventDefault();
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
  .chat-input-hidden {
    width: calc(100% - 22px);
    margin: 5px 10px;
    min-height: 19px;
  }

  .connect-button {
    width: calc(100% - 20px);
    margin: 5px 10px;
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
</style>
