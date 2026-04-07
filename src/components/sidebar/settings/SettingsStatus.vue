<template>
  <SettingsGroup title="Status">
    <p>You are currently {{ profile.isAway ? `away (${profile.awayReason})` : 'active' }}.</p>

    <BForm
      class="away-message-form mb-3"
      @submit.prevent="updateAwayReason"
      @reset.prevent="setAsActive"
    >
      <BFormGroup :label="profile.isManualAway ? 'Update Away Message' : 'Set Away Message'">
        <BInputGroup size="sm">
          <BFormInput v-model.trim="awayReasonBuffer" autocomplete="off" name="away-reason" />
          <BButton type="submit" variant="warning" class="px-3">Away</BButton>
        </BInputGroup>
      </BFormGroup>

      <BButton
        v-if="profile.isManualAway"
        class="px-3 align-self-end"
        type="reset"
        variant="primary"
        size="sm"
        >Set as Active</BButton
      >
    </BForm>

    <BFormCheckbox v-model="profile.autoAwayEnabled" switch>Away on Inactivity</BFormCheckbox>
  </SettingsGroup>
</template>

<script setup lang="ts">
  import { useProfileStore } from '#stores';
  import {
    BButton,
    BForm,
    BFormCheckbox,
    BFormGroup,
    BFormInput,
    BInputGroup,
  } from 'bootstrap-vue-next';
  import { ref } from 'vue';
  import SettingsGroup from './ui/SettingsGroup.vue';

  const profile = useProfileStore();
  const awayReasonBuffer = ref('');

  function updateAwayReason() {
    profile.setAway(awayReasonBuffer.value);
    awayReasonBuffer.value = '';
  }

  function setAsActive() {
    profile.setUnaway();
    awayReasonBuffer.value = '';
  }
</script>

<style scoped>
  .away-message-form {
    display: flex;
    gap: 0.5em;
    flex-direction: column;
    align-items: stretch;
  }
</style>
