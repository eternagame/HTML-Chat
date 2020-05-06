<template>
  <div id="user-wrapper">
    <h3>Online ({{userCount}})</h3>
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
  padding-left:20px;
  overflow: auto;
  height:calc(100% - 50px);
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-thumb {
  background-color:#343a40;
  border-radius:5px;
}

li {
  list-style-type: none;
}
h3 {
  margin-bottom:2px;
}
</style>
