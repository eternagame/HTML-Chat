<template>
  <div
    id="app1"
    style="height:100%; overflow-y:hidden;"
  >
    <login v-if="!logged" @login="login"/>
    <chat-app
      v-if="logged"
      :username="username"
      :uid="uid"
      workbranch="eternagame.org"
      positionBasis="initial" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import ChatApp from '@/App.vue';
  import Login from './components/Login.vue';

  @Component({
    components: {
      ChatApp,
      Login,
    },
  })
  export default class App extends Vue {
    logged = false;

    username!: string;

    uid!: string;

    created() {
      if (localStorage.chat_username) {
        this.username = localStorage.chat_username;
        this.uid = localStorage.chat_uid;
        this.logged = true;
      }
    }

    login({ username, uid, remember }: {username: string, uid: string, remember: boolean}) {
      this.username = username;
      this.uid = uid;
      this.logged = true;
      if (remember) {
        localStorage.chat_username = username;
        localStorage.chat_uid = uid;
      }
    }
  }
</script>

<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Didact+Gothic|Open+Sans:400,300,600,700);

@import "@/assets/global.scss";
@import '~bootstrap-vue/src/index.scss';
@import '~bootstrap/scss/bootstrap.scss';
@import "@/assets/_custom.scss";

body {
  min-width: 0;
}

#app1 {
  color: white;
  font-family: "Helvetica Neue", "Open Sans", Arial, Gulim;
  font-size: 14px;
  font-weight: 300;
}
</style>
