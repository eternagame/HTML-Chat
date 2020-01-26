<template>
  <div class="login">
    <div class="trans-panel-bg  rounded-10"></div>
    <div class="trans-panel rounded-10">
      <form>
        <table>
          <tr>
            <td><span for="username">username:</span></td>
            <td><input type="text" id="username" v-model="username"/></td>
          </tr>
          <tr>
            <td><span for="uid">uid:</span></td>
            <td><input type="text" id="uid" v-model="uid"/></td>
          </tr>
          <tr>
            <td><label for="remember-me">Remember Me:</label></td>
            <td><input id="remember-me" type="checkbox" v-model="remember" style="width: auto"></td>
          </tr>
        </table>
        <div
          class="green-button"
          style="width: 40%; left: 50%; transform: translateX(-50%);"
          @click="$emit('login', { uid, username, remember })"
        >
          Continue
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
  export default class Login extends Vue {
    uid: string = '';

    username: string = '';

    remember: boolean = false;
  }
</script>

<style lang="scss">
  .login {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
  }

  td {
    padding: 2px;
  }

  .blue-button,
  .green-button {
    padding: 4px 7px !important;
  }
</style>
