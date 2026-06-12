<template>
  <div class="login-container">
    <div class="login">
      <BForm @submit.prevent="onSubmit">
        <BFormGroup label="Username" class="mb-3">
          <BFormInput name="username" type="text" v-model.trim="form.username" required />
        </BFormGroup>

        <BFormGroup
          label="UID"
          class="mb-3"
          :state="uidError.length === 0"
          :invalid-feedback="uidError"
        >
          <BFormInput name="uid" type="text" inputmode="numeric" v-model.trim="form.uid" required />
        </BFormGroup>

        <BFormCheckbox name="remember" class="mb-3" reverse v-model="form.remember"
          >Remember Me</BFormCheckbox
        >

        <BButton class="w-100 mb-2" variant="primary" type="submit">Continue</BButton>
        <BButton class="w-100" variant="primary" type="button" @click="anonLogin"
          >Continue as anonymous</BButton
        >
      </BForm>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ANONYMOUS_USER } from '#constants';
  import { useIrcStore } from '#stores';
  import { BForm, BFormInput, BFormGroup, BFormCheckbox, BButton } from 'bootstrap-vue-next';
  import { computed, reactive, toRaw } from 'vue';

  const irc = useIrcStore();

  const form = reactive({
    username: '',
    uid: '',
    remember: false,
  });
  const uidError = computed(() => {
    if (form.uid.length === 0) {
      return 'Must provide a User ID';
    } else if (!form.uid.match(/^\d+$/)) {
      return 'Must be a number';
    }
    return '';
  });

  function onSubmit() {
    irc.signIn(toRaw(form));
  }

  function anonLogin() {
    irc.signIn({ username: ANONYMOUS_USER.displayName, uid: ANONYMOUS_USER.uid, remember: false });
  }
</script>
<style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
  }

  .login {
    padding: 0.75rem;
    background-color: #043468;
  }
</style>
