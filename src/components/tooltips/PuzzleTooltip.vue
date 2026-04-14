<template>
  <BPopover v-if="puzzleId" @show="onShow" :target="target">
    <div v-if="isLoadingPuzzle">Loading...</div>

    <template v-else>
      <article v-if="currentPuzzle" class="puzzle">
        <div class="puzzle-title">{{ currentPuzzle.title }}</div>

        <div class="puzzle-author">
          <a :href="puzzleAuthorLink" target="_blank">{{ currentPuzzle.username }}</a>
          {{ currentPuzzle.username }}
        </div>

        <dl>
          <dt>Solvers</dt>
          <dd>{{ currentPuzzle['num-cleared'] }}</dd>

          <dt>Reward</dt>
          <dd>{{ currentPuzzle.reward }}</dd>
        </dl>

        <div v-if="currentPuzzle.body" class="puzzle-description" v-html="currentPuzzle.body"></div>
        <div v-else class="puzzle-description puzzle-description--empty">
          <p>No description provided.</p>
        </div>
      </article>

      <article v-else class="puzzle puzzle--not-found">
        <p>Could not find puzzle {{ puzzleId }}</p>
      </article>
    </template>
  </BPopover>
</template>
<script setup lang="ts">
  import { usePuzzleStore } from '#stores';
  import { BPopover } from 'bootstrap-vue-next';
  import { computed } from 'vue';

  const props = defineProps<{
    puzzleId: string | null;
    target?: HTMLElement | null;
  }>();

  const puzzleStore = usePuzzleStore();
  const isLoadingPuzzle = computed(
    () => props.puzzleId !== null && puzzleStore.isLoadingPuzzle(props.puzzleId),
  );
  const currentPuzzle = computed(() => {
    if (!props.puzzleId) {
      return null;
    } else {
      return puzzleStore.getPuzzle(props.puzzleId);
    }
  });
  const puzzleAuthorLink = computed(() => {
    if (!currentPuzzle.value) {
      return undefined;
    }
    return `https://eternagame.org/players/${currentPuzzle.value.uid}`;
  });

  function onShow() {
    if (props.puzzleId) {
      puzzleStore.loadPuzzle(props.puzzleId);
    }
  }
</script>
<style scoped>
  .puzzle {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 250px;
  }

  .puzzle-title,
  .puzzle-author {
    text-align: center;
    text-wrap: balance;
  }

  .puzzle-description {
    max-width: 50ch;
  }
</style>
