import type { Message, Report, User } from '#models';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';
import { useIrcStore } from './irc.store';
import { OPERATOR_NOTIFICATION_CHANNEL } from '#constants';

export const useReportStore = defineStore('report', () => {
  const irc = useIrcStore();
  const isModalVisible = ref(false);
  const isSendingReport = ref(false);
  const reportConfirmationId = ref<string | null>(null);
  const currentTarget = ref<Pick<Report, 'targetUser' | 'targetMessage'> | null>(null);

  function startReport(targetUser: User, targetMessage?: Message) {
    isModalVisible.value = true;
    reportConfirmationId.value = crypto.randomUUID();
    currentTarget.value = { targetUser, targetMessage };
  }

  function submitReport(reportComments: string) {
    if (!irc.client || !currentTarget.value) {
      return;
    }
    const { targetUser, targetMessage } = currentTarget.value;
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
      `[REPORT] Reporting ${targetUser.username} (${targetUser.uid}) by ${irc.currentUser.username} (${irc.currentUser.uid})`,
      { label: reportConfirmationId.value! },
    );
    if (targetMessage) {
      irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, `[REPORTED MESSAGE] ${targetMessage.message}`, {
        label: reportConfirmationId.value!,
      });
    }
    irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, `[REPORT REASON] ${reportComments}`, {
      label: reportConfirmationId.value!,
    });
  }

  function closeModal() {
    isModalVisible.value = false;
    isSendingReport.value = false;
    reportConfirmationId.value = null;
    currentTarget.value = null;
  }

  return {
    isModalVisible: readonly(isModalVisible),
    isSendingReport: readonly(isSendingReport),
    currentTarget: readonly(currentTarget),
    startReport,
    submitReport,
    closeModal,
  };
});
