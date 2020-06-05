<template>
  <div class="login panel">
    <div class="trans-panel rounded-10" v-show="showsMessage">
      <p> {{message}}</p>
      <div
          class="green-button"
          style="width: 90%; left: 50%; transform: translateX(-50%); margin-top:10px"
          @click="showsMessage = false; $emit('cancel')"
        >
        Continue
      </div>
    </div>
    <div class="trans-panel rounded-10" v-show="!showsMessage">
      <form>
        <table>
          <tr>
            <td><span for="username">User:</span></td>
            <td><input type="text" id="username" v-model="username"/></td>
          </tr>
          <tr>
            <td><span for="password">Password:</span></td>
            <td><input type="password" id="password" v-model="password"/></td>
          </tr>
          <tr>
            <td><span for="remember">Remember:</span></td>
            <td><input type="checkbox" id="remember" v-model="remember"/></td>
          </tr>
        </table>
        <p v-show="authFailed">Username or password incorrect</p>
        <div
          class="green-button"
          style="width: 90%; left: 50%; transform: translateX(-50%); margin-top:10px"
          @click="$emit('login', { password, username, remember })"
        >
        Continue
        </div>
        <div
          class="green-button"
          style="width: 90%; left: 50%; transform: translateX(-50%); margin-top:10px;"
          @click="$emit('cancel')"
        >
          Cancel
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: {},
  })
  export default class OperLogin extends Vue {
    remember = false;

    password: string = '';

    username: string = '';

    showsMessage = false;

    message = '';

    authFailed = false;
  }
</script>

<style lang="scss">
  .login {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    background-color:#043468;
    border-radius:10px;
    z-index:3;
  }

  td {
    padding: 2px;
  }

  .blue-button,
  .green-button {
    padding: 4px 7px !important;
  }
</style>
