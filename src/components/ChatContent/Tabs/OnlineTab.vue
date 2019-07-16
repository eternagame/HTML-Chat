<template>
  <tab ref="tab">
    <ul>
      <Message
        v-for="user in $store.state.connectedUsers"
        :key="user.username"
      >
        <Username :user="user" />
      </Message>
    </ul>
    <template v-slot:footer>
      <ConnectButton
        v-if="!$store.state.connectionData.firstConnection &&
        !$store.state.connectionData.connected"
        class="connect-button"
        @updateHeight="$refs.tab.updateFooterHeight()"
      />
    </template>
  </tab>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator';
  import Vue from '@/types/vue';
  import Tab from './Tab.vue';
  import Username from '@/components/ChatContent/Messages/Username.vue';
  import Message from '@/components/ChatContent/Messages/Message.vue';
  import ConnectButton from '@/components/ChatContent/Connection/ConnectButton.vue';

  @Component({
    components: {
      Username,
      Tab,
      Message,
      ConnectButton,
    },
  })
  export default class OnlineTab extends Vue {
    $refs!: {
      tab: HTMLFormElement;
    };

    created() {
      this.$store.subscribe((mutation, state) => {
        if (['addUser', 'removeUser'].indexOf(mutation.type) !== -1) {
          this.$refs.tab.onContentChanged();
        }
      });
      this.$store.subscribe((muatation, state) => {
        if (muatation.type === 'setConnected') this.$refs.tab.onContentChanged();
      });
      this.$store.watch(state => state.connectionData.connected,
                       () => this.$nextTick(this.$refs.tab.updateFooterHeight));
    }
  }
</script>
