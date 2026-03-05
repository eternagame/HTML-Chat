<template>
  <div class="login-container">
    <div class="login">
      <BForm @submit.prevent="onSubmit">
        <BFormGroup
          label="Username"
          class="mb-3"
          :state="usernameError.length === 0"
          :invalid-feedback="usernameError"
        >
          <BFormInput name="username" type="text" v-model.trim="form.username" />
        </BFormGroup>

        <BFormGroup
          label="UID"
          class="mb-3"
          :state="uidError.length === 0"
          :invalid-feedback="uidError"
        >
          <BFormInput name="uid" type="text" inputmode="numeric" v-model.trim="form.uid" />
        </BFormGroup>

        <BFormCheckbox name="remember" class="mb-3" reverse v-model="form.remember"
          >Remember Me</BFormCheckbox
        >

        <BButton class="w-100 mb-2" variant="success" type="submit">Continue</BButton>
        <BButton class="w-100" variant="success" type="button" @click="anonLogin"
          >Continue as anonymous</BButton
        >
      </BForm>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { BForm, BFormInput, BFormGroup, BFormCheckbox, BButton } from 'bootstrap-vue-next';
  import { computed, reactive, toRaw } from 'vue';

  const emit = defineEmits<{
    (event: 'login', values: { username: string; uid: string; remember: boolean }): void;
  }>();

  const form = reactive({
    username: '',
    uid: '',
    remember: false,
  });

  const usernameError = computed(() => {
    if (form.username.length === 0) {
      return 'Must provide a Username';
    }
    return '';
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
    emit('login', toRaw(form));
  }

  function anonLogin() {
    emit('login', { username: 'anonymous', uid: '0', remember: false });
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
