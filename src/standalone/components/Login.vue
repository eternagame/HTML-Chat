<!-- eslint-disable vue/multi-word-component-names TODO: Rename file -->
<template>
  <div class="login">
    <div class="trans-panel-bg rounded-10" />
    <div class="trans-panel rounded-10">
      <form>
        <div class="form-group">
          <label class="form-control-label" for="username">Username</label>
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
          @click="emit('login', { uid, username, remember })"
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

<script lang="ts" setup>
import { computed, ref } from 'vue';

const emit = defineEmits<{
  (event: 'login', input: { uid: string, username: string, remember: boolean }): void
}>();

const uid = ref<string>('');
const username = ref<string>('');
const remember = ref<boolean>(false);

const idError = computed<string>(() => {
  if (!parseInt(uid.value, 10)) return 'Must be a number';
  if (uid.value.trim() === '') return 'Must provide a user id';
  return '';
});
const nameError = computed<string>(() => {
  if (username.value.trim() === '') return 'Must provide a username';
  return '';
});

function anonLogin() {
  emit('login', { uid: '0', username: 'Anonymous', remember: remember.value });
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
