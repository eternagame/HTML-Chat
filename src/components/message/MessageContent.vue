<template>
  <div class="message-content-container">
    <div
      class="message-content"
      v-html="formattedMessage"
      @pointerover="onHoverFocus"
      @focusin="onHoverFocus"
      @click="onClick"
      @auxclick="onClick"
    />
    <PuzzleTooltip :puzzle-id="puzzleId" :target="puzzleTarget" />
  </div>
</template>
<script setup lang="ts">
  import PuzzleTooltip from '#components/tooltips/PuzzleTooltip.vue';
  import { useChannelStore, useConfirmationStore } from '#stores';
  import { md, PUZZLE_LINK_REGEX } from '#utils';
  import { computed, ref, shallowRef } from 'vue';

  const props = defineProps<{
    content: string;
  }>();

  const channel = useChannelStore();
  const confirmation = useConfirmationStore();

  const formattedMessage = computed(() => md.renderInline(props.content));
  const puzzleId = ref<string | null>(null);
  const puzzleTarget = shallowRef<HTMLElement | null>();

  function onHoverFocus(event: PointerEvent | FocusEvent) {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>('.link--puzzle');
    if (!target) {
      return;
    }

    const match = target.href.match(PUZZLE_LINK_REGEX);
    if (match) {
      const puzzleIdMatch = match[1];
      puzzleId.value = puzzleIdMatch;
      puzzleTarget.value = target;
    }
  }

  function onClick(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('.link--external');
    if (link) {
      event.preventDefault();
      confirmation.prompt(
        {
          title: 'External Link Warning',
          message: `"${link.href}" is an external site. Do you wish to proceed?`,
        },
        () => {
          globalThis.open(link.href, '_blank', 'noopener,noreferrer');
        },
      );
      return;
    }

    const channelButton = target.closest<HTMLButtonElement>('.tag--channel');
    if (channelButton && channelButton.hasAttribute('data-channel')) {
      const channelName = channelButton.getAttribute('data-channel')!;
      channel.goToChannel(channelName);
    }
  }
</script>
<style scoped lang="scss">
  @import '#styles/_variables.scss';

  :deep(.message-content) {
    word-break: break-word;

    .link {
      &:empty {
        display: none;
      }

      &.link--image {
        display: inline-block;
      }
      &.link--external {
        &::after {
          font-size: 0.8em;
          position: relative;
          top: -0.25em;
          content: ' ↗';
          text-decoration: none;
        }
      }
    }

    .screenshot {
      object-fit: contain;
      max-width: 500px;
      width: 100%;
    }
    .highlight {
      background-color: yellow;
      color: black;
    }
    blockquote {
      display: inline-block;
      margin: 0;
      border-left: 5px solid gray;
      padding-left: 0.125em;
      quotes: '“' '”' '‘' '’';
      &::before,
      &::after {
        display: inline-block;
      }
      &::before {
        margin-left: 2px;
        content: open-quote;
      }
      &::after {
        content: close-quote;
      }
    }

    .tag {
      background-color: darken($dark-blue, 5%) !important;
      border: none;
      font: inherit;
      outline-color: currentColor;
      color: inherit;
      padding: 0;
      &:hover,
      &:focus {
        color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
      }
    }
  }
</style>
