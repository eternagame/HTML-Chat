<template>
  <div id="user-wrapper" :style="{ fontSize:`${fontSize}px` }">
    <h4>Online ({{userCount}})</h4>
    <ul class="list-group list-style-type-none">
      <SlideoutUsername
        v-for="user in connectedUsers"
        :key="user.username"
        :user="user" />
    </ul>
  </div>
</template>
<script lang="ts">
  import {
    Vue, Component, Prop, Watch,
  } from 'vue-property-decorator';
  import Slideout from '../Slideout.vue';
  import Username from '../../Messages/Username.vue';
  import ActionMenu from '../../Messages/ActionMenu.vue';
  import Message from '@/types/message';
  import User from '@/types/user';
  import SlideoutUsername from './SlideoutUsername.vue';

  @Component({
    components: {
      Username,
      ActionMenu,
      SlideoutUsername,
    },
  })
  export default class SlideoutUser extends Vue {
    get connectedUsers() {
      return this.$vxm.chat.connectedUsers;
    }

    get userCount() {
      return Object.keys(this.$vxm.chat.connectedUsers).length;
    }

    get fontSize() {
      return this.$vxm.settings.fontSize;
    }
  }
</script>
<style scoped>
#user-wrapper {
  padding:5px;
  padding-left:20px;
  overflow: auto;
  height:calc(100% - 50px); /* Fills slideout and accounts for top bar */
}

::-webkit-scrollbar {
    width: 10px;
    height:10px;
}

::-webkit-scrollbar-thumb {
  background-color:#343a40; /* Make scrollbar visible */
  border-radius:5px;
}

::-webkit-scrollbar-corner {
  background-color:#343a40;
  border-radius:5px;
}

li {
  list-style-type: none; /* Remove bullet points */
}
h3 {
  margin-bottom:2px; /* Title */
}
</style>
