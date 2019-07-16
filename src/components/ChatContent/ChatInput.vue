<template>
  <div style="overflow: hidden; position: relative;">
    <textarea
      v-model="message"
      :style="{height: `${height}px`}"
      class="chat-input"
      :disabled="!$store.state.connectionData.connected || isBanned"
      @input="updateHeight"
      @keypress="onKeyPress"
    />
    <div
      ref="hiddenDiv"
      class="chat-input-hidden"
    ></div>
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
      this.$refs.hiddenDiv.textContent = this.message;
      this.height = this.$refs.hiddenDiv.clientHeight;
      this.$emit('updateHeight');
    }

    mounted() {
      this.$nextTick(this.updateHeight);
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
    position: absolute;
    top: 0px;
  }

  .chat-input,
  .chat-input-hidden {
    width: calc(100% - 2px); //100% - border
    min-height: 19px;
  }

  /* To determine input size */
  .chat-input-hidden {
    position:relative;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid;
  }
</style>
