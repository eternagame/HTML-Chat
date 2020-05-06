<template>
  <div id="settings-wrapper">
    <h2>Text Size</h2>
    <input v-model="message" type=number min=10 max=22 value=24>
    <p id='font-size-p'>Default is 14</p>
    <h2>Ignored Users</h2>
    <ul>
      <li v-for="user in ignoredUsers" :key="user.Username">
        {{ user }}
        <button class='unignore-user' v-on:click="unign(user)">Unignore</button>
      </li>
      <li v-show="!anyIgnoredUsers">No users ignored</li>
      <button class='unignore-user' v-on:click="unign('*')" v-show="anyIgnoredUsers" >
        Unignore All</button>
    </ul>
  </div>
</template>
<script lang="ts">
  import {
    Component, Watch, Prop, Vue,
  } from 'vue-property-decorator';
  import Username from '@/components/Messages/Username.vue';
  import ConnectButton from '@/components/Connection/ConnectButton.vue';
  @Component({
    components: {
      Username,
      ConnectButton,
    },
  })
  export default class SlideoutSettings extends Vue {
    @Prop({ required: true })
    message:string = '14';

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
  background-color:white;
}
#settings-wrapper {
  padding:5px;
}
</style>
