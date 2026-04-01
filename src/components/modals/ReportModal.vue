<template>
  <AppModal :title="title" :model-value="report.isModalVisible">
    <BForm @submit.prevent="onSubmit">
      <dl>
        <dt>User</dt>
        <dd>{{ report.currentTarget?.targetUser.username ?? '' }}</dd>

        <template v-if="report.currentTarget?.targetMessage">
          <dt>Message</dt>
          <dd>{{ report.currentTarget.targetMessage.message }}</dd>
        </template>
      </dl>

      <BFormFloatingLabel label="Additional Comments" :label-for="commentId">
        <BFormTextarea :id="commentId" v-model="commentBuffer" />
      </BFormFloatingLabel>
    </BForm>

    <template v-slot:footer>
      <BButton type="button" variant="secondary" @click="onSubmit">Submit Report</BButton>
      <BButton type="button" variant="outline-secondary" @click="onCancel">Cancel</BButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
  import AppModal from '#components/ui/AppModal.vue';
  import { useReportStore } from '#stores';
  import { BButton, BForm, BFormFloatingLabel, BFormTextarea } from 'bootstrap-vue-next';
  import { computed, ref, useId } from 'vue';

  const report = useReportStore();
  const title = computed(() =>
    report.currentTarget ? `Reporting ${report.currentTarget.targetUser.username}` : '',
  );
  const commentId = useId();
  const commentBuffer = ref('');

  function onSubmit() {
    report.submitReport(commentBuffer.value.trim());
    commentBuffer.value = '';
  }
  function onCancel() {
    report.closeModal();
    commentBuffer.value = '';
  }
</script>
