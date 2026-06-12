<template>
  <SettingsGroup title="Operator">
    <template v-if="irc.isOperator">
      <p>You are an operator</p>
    </template>
    <template v-else>
      <div class="operator-login">
        <BForm @submit.prevent="onSubmit">
          <BFormGroup label="Operator Username">
            <BFormInput
              name="username"
              type="text"
              v-model.trim="form.username"
              required
              autocomplete="username"
            />
          </BFormGroup>
          <BFormGroup label="Password" class="mt-2">
            <BFormInput
              name="password"
              type="password"
              v-model.trim="form.password"
              required
              autocomplete="password"
            />
          </BFormGroup>
          <BButton class="w-100 mt-2" variant="primary" type="submit" :disabled="!canSubmit"
            >Sign In</BButton
          >
        </BForm>
      </div>
    </template>
  </SettingsGroup>
</template>
<script setup lang="ts">
  import { useIrcStore, useOperatorStore } from '#stores';
  import { BButton, BForm, BFormGroup, BFormInput } from 'bootstrap-vue-next';
  import { computed, reactive } from 'vue';
  import SettingsGroup from './ui/SettingsGroup.vue';

  const irc = useIrcStore();
  const operator = useOperatorStore();
  const form = reactive({
    username: '',
    password: '',
  });
  const canSubmit = computed(() => form.username.length > 0 && form.password.length > 0);

  function onSubmit() {
    if (canSubmit.value) {
      operator.signIn(form.username, form.password);
    }
  }
</script>
<style scoped>
  .operator-login {
    padding: 0.75rem;
  }
</style>
