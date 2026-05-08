<template>
  <AppModal
    v-if="confirmation.data"
    :model-value="confirmation.isOpen"
    :title="confirmation.data.title"
  >
    <p v-if="confirmation.data.message">{{ confirmation.data.message }}</p>
    <template v-slot:footer>
      <BButton type="button" variant="primary" @click="confirmation.confirm">{{
        confirmation.data.confirmLabel
      }}</BButton>
      <BButton type="button" variant="outline-secondary" @click="confirmation.cancel">{{
        confirmation.data.cancelLabel
      }}</BButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
  import AppModal from '#components/ui/AppModal.vue';
  import { useConfirmationStore } from '#stores';
  import { BButton } from 'bootstrap-vue-next';

  const confirmation = useConfirmationStore();
</script>
