import type { Message } from '#models';
import { ref, toValue, watch, type DeepReadonly, type MaybeRefOrGetter } from 'vue';

export interface MessageGroup extends Pick<Message, 'nick' | 'username' | 'type'> {
  id: string;
  messages: Message[];
}

/**
 * Group consecutive messages from same user incrementally.
 * Does not group `notice` messages.
 */
export function useMessageGroups(messages: MaybeRefOrGetter<Message[] | DeepReadonly<Message[]>>) {
  const messageGroups = ref<MessageGroup[]>([]);

  watch(
    () => toValue(messages),
    (allMessages) => {
      if (allMessages.length === 0) {
        messageGroups.value = [];
        return;
      }

      // Remove messages from start of list
      while (messageGroups.value.length > 0) {
        const firstGroup = messageGroups.value[0];
        const firstMessageInGroup = firstGroup.messages[0];
        const firstMessageInSource = allMessages[0];

        if (firstMessageInGroup.id === firstMessageInSource.id) {
          // Synchronized the start of the messages
          break;
        }

        // Otherwise, remove expired message from group
        firstGroup.messages.shift();
        if (firstGroup.messages.length === 0) {
          // Last message of group was removed, so group must be removed
          messageGroups.value.shift();
        }
      }

      // Remove messages from middle of list
      const totalInGroups = messageGroups.value.reduce(
        (total, group) => total + group.messages.length,
        0,
      );
      if (totalInGroups > allMessages.length) {
        const messageIds = new Set(allMessages.map((m) => m.id));
        for (let index = messageGroups.value.length - 1; index >= 0; index--) {
          const group = messageGroups.value[index];
          // Remove messages that are no longer present
          group.messages = group.messages.filter((m) => messageIds.has(m.id));
          if (group.messages.length === 0) {
            // Remove group if there are no more messages
            messageGroups.value.splice(index, 1);
          }
        }
      }

      // Find starting point for adding new messages
      let newMessages: readonly Message[] = [];
      const lastSurvivingGroup = messageGroups.value.at(-1);
      if (!lastSurvivingGroup) {
        newMessages = allMessages;
      } else {
        // Safe to assume that the message exists here since empty groups were removed earlier
        const safeLastMessageId = lastSurvivingGroup.messages.at(-1)!.id;
        const lastMessagePosition = allMessages.findIndex((m) => m.id === safeLastMessageId);
        newMessages =
          lastMessagePosition === -1 ? allMessages : allMessages.slice(lastMessagePosition + 1);
      }

      // Add new messages
      for (const message of newMessages) {
        const prevGroup = messageGroups.value.at(-1) ?? null;

        if (
          !prevGroup ||
          prevGroup.type !== message.type ||
          message.type === 'notice' ||
          prevGroup.username !== message.username
        ) {
          messageGroups.value.push({
            id: `group-${message.username}-${message.id}`,
            type: message.type,
            messages: [message],
            nick: message.nick,
            username: message.username,
          });
        } else {
          prevGroup.messages.push(message);
        }
      }
    },
    { deep: 1, immediate: true },
  );
  return { messageGroups };
}
