import type { Puzzle } from '#models';
import { defineStore } from 'pinia';
import { reactive, readonly } from 'vue';

export const usePuzzleStore = defineStore('puzzle', () => {
  const puzzleInfoCache = reactive(new Map<string, Puzzle>());

  function getPuzzleInfo(puzzleId: string): Readonly<Puzzle> | null {
    const puzzleInfo = puzzleInfoCache.get(puzzleId);

    if (puzzleInfo) {
      return readonly(puzzleInfo);
    } else {
      return null;
    }
  }

  return {
    getPuzzleInfo,
  };
});
