import type { Puzzle } from '#models';
import { getPuzzleInfo } from '#services';
import log from 'loglevel';
import { defineStore } from 'pinia';
import { reactive, readonly } from 'vue';

export const usePuzzleStore = defineStore('puzzle', () => {
  const puzzleCache = reactive(new Map<string, Puzzle>());
  const puzzleIdLoading = reactive(new Set<string>());

  function getPuzzle(puzzleId: string): Readonly<Puzzle> | null {
    const puzzle = puzzleCache.get(puzzleId);

    if (puzzle) {
      return readonly(puzzle);
    } else {
      return null;
    }
  }

  function isLoadingPuzzle(puzzleId: string) {
    return puzzleIdLoading.has(puzzleId);
  }

  async function loadPuzzle(puzzleId: string) {
    if (puzzleCache.has(puzzleId) || isLoadingPuzzle(puzzleId)) {
      return;
    }

    puzzleIdLoading.add(puzzleId);
    try {
      const info = await getPuzzleInfo(puzzleId);
      if (info) {
        puzzleCache.set(puzzleId, info);
      }
    } catch (error) {
      log.error(error);
    } finally {
      puzzleIdLoading.delete(puzzleId);
    }
  }

  return {
    getPuzzle,
    loadPuzzle,
    isLoadingPuzzle,
  };
});
