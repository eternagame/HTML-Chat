import type { Message } from '#models';
import { computed, toValue, type DeepReadonly, type MaybeRefOrGetter } from 'vue';

/**
 * Find positions in message list where the sender differs from the previous message.
 */
export function useMessageGroups(messages: MaybeRefOrGetter<Message[] | DeepReadonly<Message[]>>) {
  const groupStartPositions = computed(() => {
    const allMessages = toValue(messages);
    const positions = new Set<number>([0]);
    let lastSender: string | null = allMessages[0]?.username ?? null;
    let lastTime: number = allMessages[0]?.time ?? 0;

    for (let index = 1; index < allMessages.length; index++) {
      const message = allMessages[index];
      if (message.username !== lastSender || message.time - lastTime > 5 * 60 * 1000) {
        lastSender = message.username;
        positions.add(index);
      }
    }
    return positions;
  });
  return groupStartPositions;
}
