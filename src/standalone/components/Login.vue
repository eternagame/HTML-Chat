<template>
  <div class="login">
    <div class="trans-panel-bg rounded-10"></div>
    <div class="trans-panel rounded-10">
      <form>
        <div class="form-group">
          <label class="forn-control-label" for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-control"
          />
          <div class="invalid-feedback d-block" v-if="nameError !== ''">{{ nameError }}</div>
        </div>
        <div class="form-group">
          <label class="form-control-label" for="uid">UID</label>
          <input
            type="text"
            id="uid"
            v-model="uid"
            class="form-control"
          />
          <div class="invalid-feedback d-block" v-if="idError !== ''">{{ idError }}</div>
        </div>
        <div class="form-group">
          <label class="form-control-label" for="remember-me">Remember Me</label>
          <input
            id="remember-me"
            type="checkbox"
            class="ml-2 align-text-bottom pb-1"
            v-model="remember">
        </div>
        <button
          class="btn btn-primary w-100"
          type="submit"
          @click="$emit('login', { uid, username, remember })"
        >
          Continue
        </button>
        <button
          class="btn btn-primary w-100 mt-2"
          type="submit"
          @click="anonLogin"
        >
          Continue as anonymous
        </button>
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

    get idError() {
      if (!parseInt(this.uid, 10)) return 'Must be a number';
      if (this.uid.trim() === '') return 'Must provide a user id';
      return '';
    }

    get nameError() {
      if (this.uid.trim() === '') return 'Must provide a username';
      return '';
    }

    anonLogin() {
      this.$emit('login', { uid: '0', username: 'Anonymous', remember: this.remember });
    }
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
