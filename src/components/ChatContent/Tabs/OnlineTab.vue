<template>
  <tab ref="tab">
    <ul>
      <message v-for="user in $store.state.connectedUsers" :key="user.nick">
        <username :user="user"></username>
      </message>
    </ul>
  </tab>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "@/types/vue";
import Tab from "./Tab.vue";
import Username from "@/components/ChatContent/Messages/Username.vue";
import Message from "@/components/ChatContent/Messages/Message.vue";
@Component({
  components: {
    Username,
    Tab,
    Message
  }
})
export default class OnlineTab extends Vue {
  
  $refs!: {
    tab: HTMLFormElement;
  };

  created() {
    this.$store.subscribe((mutation, state) => {
      if (["addUser", "removeUser"].indexOf(mutation.type) !== -1) {
        this.$refs.tab.onContentChanged();
      }
    });
  }

  //   openMenu(event, message) {
  //     this.$refs.vueSimpleContextMenu.showMenu(event, message);
  //   }
}
</script>
