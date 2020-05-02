<template>
  <Pane ref="pane" :visibility="visibility">
    <h1>Text Size</h1>
    <input v-model="message" type=number min=10 max=22 value=24>
    <span id='font-size-p'>{{text}} Default is 14</span>
    <h1>Ignored Users</h1>
    <ul>
      <li v-for="user in ignoredUsers" :key="user.Username">
        {{ user }}
        <button class='unignore-user' v-on:click="unign(user)">Unignore</button>
      </li>
      <button class='unignore-user' v-on:click="unign('*')" v-show="anyIgnoredUsers" >
        Unignore All</button>
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
  export default class SettingsPane extends Vue {
    @Prop({ required: true })
    visibility!: boolean;

    $refs!: {
      pane: Pane;
    };

    @Prop({ required: true })
    message:string = '14';

    get text() {
      if (this.message.toString()) {
        return '';
      }
      return '';
    }

    get fontSize() {
      return parseInt(this.message, 10) === 14 ? 14 : 50;
    }

    get connectedUsers() {
      return this.$vxm.chat.connectedUsers;
    }

    get connectionData() {
      return this.$vxm.chat.connectionData;
    }

    get ignoredUsers() {
      return this.$vxm.chat.ignoredUsers;
    }

    get anyIgnoredUsers() {
      return Boolean(this.ignoredUsers.length > 0);
    }

    @Watch('connectedUsers')
    onContentChanged() {
      this.$refs.pane.onContentChanged();
    }

    @Watch('connectionData.connected')
    updateFooterHeight() {
      this.$nextTick(this.$refs.pane.updateFooterHeight);
    }

    @Watch('message')
    updateFontSize() {
      this.$vxm.chat.changeFontSize(parseInt(this.message, 10));
    }

    unign(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }
  }
</script>
<style scoped>
#font-size-p {
  vertical-align: mid;
  margin-left:2px;
}
h1 {
  margin:2px;
}
input {
  margin:2px;
}
.unignore-user {
  padding:2px;
  padding-bottom:3px;
}
</style>
