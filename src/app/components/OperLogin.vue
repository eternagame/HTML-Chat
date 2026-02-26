<template>
  <div class="login panel p-2 rounded">
    <div class="trans-panel rounded-10" v-show="showsMessage">
      <p> {{message}}</p>
      <button
        type="button"
        class="btn"
        style="width: 100%; left: 50%; margin-top:10px"
        @click="showsMessage = false; emit('cancel')"
      >
        Continue
      </button>
    </div>
    <div class="trans-panel rounded-10" v-show="!showsMessage">
      <table>
        <tr>
          <td><label for="username">User</label></td>
          <td><input name="username" type="text" id="username" v-model="username" aria-labelledby="username" /></td>
        </tr>
        <tr>
          <td><label for="password">Password</label></td>
          <td><input name="password" type="password" id="password" v-model="password" aria-labelledby="password" /></td>
        </tr>
        <tr>
          <td><label for="remember">Remember</label></td>
          <td><input type="checkbox" name="remember" id="remember" v-model="remember" aria-labelledby="remember" /></td>
        </tr>
      </table>
      <p v-show="authFailed">Username or password incorrect</p>
      <button
        type="button"
        class="btn login-button btn-primary"
        style="width: 100%; left: 50%; margin-top:10px"
        @click="emit('login', { password, username, remember })"
      >
        Continue
      </button>
      <button
        type="button"
        class="btn login-button btn-primary"
        style="width: 100%; left: 50%; margin-top:10px;"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{
  (event: 'login', login: { password: string; username: string; remember: boolean }): void;
  (event: 'cancel'): void;
}>();

const remember = ref<boolean>(false);
const password = ref<string>('');
const username = ref<string>('');

const showsMessage = ref<boolean>(false);
const authFailed = ref<boolean>(false);
const message = ref<string>('');

defineExpose({
  // TODO: Clear on failed login internally
  password,

  // TODO: Change these fields to props if they have to be externally modified
  showsMessage,
  authFailed,
  message,
});
</script>

<style lang="scss">
@import "../assets/_custom.scss";
  .login {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color:#043468;
    z-index:3;
  }

  td {
    padding: 2px;
  }

  .login-button {
    color:white;
    background-color:$green;
  }

  .login-button:focus {
    border: 2px solid white;
  }
</style>
