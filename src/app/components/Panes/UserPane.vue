<template>
  <Pane ref="pane" :visibility="visibility">
    <ul>
      <li v-for="user in connectedUsers" :key="user.username">
        <Username :user="user" />
      </li>
    </ul>
    <template v-slot:footer>
      <ConnectButton
        v-if="!connectionData.firstConnection &&
        !connectionData.connected"
        class="connect-button"
      />
    </template>
  </Pane>
</template>

<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import Pane from './Pane.vue';
  import Username from '@/components/Messages/Username.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';


  @Component({
    components: {
      Username,
      Pane,
      ConnectButton,
    },
  })
  export default class OnlinePane extends Vue {
    @Prop({ required: true })
    visibility!: boolean;

    $refs!: {
      pane: Pane;
    };

    get connectedUsers() {
      return this.$vxm.chat.connectedUsers;
    }

    get connectionData() {
      return this.$vxm.chat.connectionData;
    }

    @Watch('connectedUsers')
    onContentChanged() {
      this.$refs.pane.onContentChanged();
    }

    @Watch('connectionData.connected')
    updateFooterHeight() {
      this.$nextTick(this.$refs.pane.updateFooterHeight);
    }
  }
</script>
