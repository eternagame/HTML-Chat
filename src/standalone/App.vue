<template>
  <div
    id="app1"
    style="height:100%; overflow-y:hidden;"
  >
    <LoginForm v-if="!logged" @login="login" />
    <ChatApp
      v-if="logged"
      :username="username"
      :uid="uid"
      workbranch="eternagame.org"
      positionBasis="initial" />
  </div>
</template>

<script lang="ts" setup>
import ChatApp from '@/App.vue';
import { onMounted, ref } from 'vue';
import LoginForm from './components/LoginForm.vue';

const username = ref<string>('');
const uid = ref<string>('');
const logged = ref<boolean>(false);

onMounted(() => {
  if (localStorage.chat_username) {
    username.value = localStorage.chat_username;
    uid.value = localStorage.chat_uid;
    logged.value = true;
  }
});

function login(input: { username: string, uid: string, remember: boolean }) {
  username.value = input.username;
  uid.value = input.uid;
  logged.value = true;
  if (input.remember) {
    localStorage.chat_username = username;
    localStorage.chat_uid = uid;
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
