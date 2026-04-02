import { OPERATOR_NOTIFICATION_CHANNEL } from '#constants';
import type { Report } from '#models';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';
import { useIrcStore } from './irc.store';

export const useReportStore = defineStore('report', () => {
  const irc = useIrcStore();
  const isModalVisible = ref(false);
  const isSendingReport = ref(false);
  const reportConfirmationId = ref<string | null>(null);
  const currentTarget = ref<Report | null>(null);

  function startReport(targetUser: Report['targetUser'], targetMessage?: Report['targetMessage']) {
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
    irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, '---');
    irc.client.say(
      OPERATOR_NOTIFICATION_CHANNEL,
      `[REPORT] Reporting ${targetUser.username} (${targetUser.uid}) by ${irc.currentUser.username} (${irc.currentUser.uid})`,
      { label: reportConfirmationId.value! },
    );
    if (targetMessage) {
      irc.client.say(
        OPERATOR_NOTIFICATION_CHANNEL,
        `[REPORTED MESSAGE] "${targetMessage.message}"`,
        {
          label: reportConfirmationId.value!,
        },
      );
      irc.client.say(
        OPERATOR_NOTIFICATION_CHANNEL,
        `[CHANNEL] ${targetMessage.target} / [TIME] \`${new Date(targetMessage.time).toUTCString()}\``,
        { label: reportConfirmationId.value! },
      );
    }
    irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, `[REPORT REASON] ${reportComments}`, {
      label: reportConfirmationId.value!,
    });
    irc.client.say(OPERATOR_NOTIFICATION_CHANNEL, '---');
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
