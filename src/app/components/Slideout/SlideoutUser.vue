<template>
  <div id="user-wrapper">
    <h2>Online ({{userCount}})</h2>
    <ul>
      <li v-for="user in connectedUsers" :key="user.username">
        <Username :user="user" />
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import Slideout from './Slideout.vue';
  import Username from '../Messages/Username.vue';

  @Component({
    components: {
      Username,
    },
  })
  export default class SlideoutUser extends Vue {
    get connectedUsers() {
      return this.$vxm.chat.connectedUsers;
    }

    get userCount() {
      return Object.keys(this.$vxm.chat.connectedUsers).length;
    }

    get connectionData() {
      return this.$vxm.chat.connectionData;
    }
  }
</script>
<style scoped>
#user-wrapper {
  padding:5px;
}
</style>
