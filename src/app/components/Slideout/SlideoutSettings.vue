<template>
  <div id="settings-wrapper">
    <h3>Text Size</h3>
    <input v-model="size" type=number min=10 max=22>
    <p id='font-size-p'>Default is 14</p>
    <h3>Ignored List</h3>
    <ul>
      <li v-for="user in ignoredUsers" :key="user.Username">
        {{ user }}
        <button class='unignore-user' v-on:click="unignore(user)">Unignore</button>
      </li>
      <li v-show="!anyIgnoredUsers">No users ignored</li>
      <button class='unignore-user' v-on:click="unignore('*')" v-show="anyIgnoredUsers" >
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
  import SlideoutButton from './SlideoutButton.vue';
  import Slideout from './Slideout.vue';
  @Component({
    components: {
      Username,
      ConnectButton,
    },
  })
  export default class SlideoutSettings extends Vue {
    @Prop({ required: true })
    size!:string; // font size

    // Gets a list of ignored users
    get ignoredUsers() {
      return this.$vxm.chat.ignoredUsers;
    }

    // If any users are ignored. Uses ignoredUsers.length
    get anyIgnoredUsers() {
      return this.ignoredUsers.length > 0;
    }

    // Whether it is visible. Determined by whether slideout is opened
    get visible() {
      return (this.$parent as Slideout).checked;
    }

    // When tab opened, display stored value if there is one
    created() {
      this.size = this.$vxm.chat.fontSize.toString();
    }

    // Updates global font size when input changes
    @Watch('size')
    updateFontSize() {
      this.$vxm.chat.fontSize = parseInt(this.size, 10);
    }

    // Unignore user on list
    unignore(user:string) {
      this.$vxm.chat.unignoreUser(user);
    }
  }
</script>
<style scoped>
#font-size-p { /* 'Default is 14' text */
  vertical-align: mid;
  margin-left:2px;
  margin-bottom:15px;
}
h3 {
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  text-align:justify;
}
input {
  margin:2px;
  width:calc(100% - 23px); /* Accounts for padding on both sides */
  max-width:150px; /* Big screens don't have arbitrarily large input */
}
.unignore-user { /* Unignore user button */
  padding:2px;
  padding-bottom:3px;
  background-color:white;
}
#settings-wrapper { /* Wrapper div */
  padding:5px;
  padding-left:20px;
  height:calc(100% - 50px);
}

::-webkit-scrollbar { /* Scrollbar track */
    width: 10px;
}

::-webkit-scrollbar-thumb { /* Scrollbar bar */
  background-color:#343a40;
  border-radius:5px;
}
li { /* Remove bullets */
  list-style-type: none;
}
</style>
