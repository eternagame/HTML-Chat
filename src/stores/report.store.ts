import type { Report } from '#models';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';
import { useIrcStore } from './irc.store';
import { OPERATOR_NOTIFICATION_CHANNEL } from '#constants';

export const useReportStore = defineStore('report', () => {
  const irc = useIrcStore();
  const isModalVisible = ref(false);
  const isSendingReport = ref(false);
  const reportConfirmationId = ref<string | null>(null);

  function openModal() {
    isModalVisible.value = true;
    reportConfirmationId.value = crypto.randomUUID();
  }

  function submitReport(report: Omit<Report, 'reporter'>) {
    if (!irc.client) {
      return;
    }

    irc.client.on('privmsg', function reportConfirmed(event) {
      if (event.tags.label !== reportConfirmationId.value) {
        return;
      }

      irc.client?.removeListener('privmsg', reportConfirmed);
      closeModal();
    });

    isSendingReport.value = true;
    irc.client.say(
      OPERATOR_NOTIFICATION_CHANNEL,
      `[REPORT] Reporting ${report.targetUser.username} (${report.targetUser.uid}) by ${irc.currentUser.username} (${irc.currentUser.uid})`,
      { label: reportConfirmationId.value! },
    );
    if (report.targetMessage) {
      irc.client.say(
        OPERATOR_NOTIFICATION_CHANNEL,
        `[REPORTED MESSAGE] ${report.targetMessage.message}`,
        { label: reportConfirmationId.value! },
      );
    }
    irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, `[REPORT REASON] ${report.reportComments}`, {
      label: reportConfirmationId.value!,
    });
  }

  function closeModal() {
    isModalVisible.value = false;
    isSendingReport.value = false;
    reportConfirmationId.value = null;
  }

  return {
    isModalVisible: readonly(isModalVisible),
    isSendingReport: readonly(isSendingReport),
    openModal,
    submitReport,
    closeModal,
  };
});
