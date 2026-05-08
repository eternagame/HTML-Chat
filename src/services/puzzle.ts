import type { Puzzle } from '#models';

export async function getPuzzleInfo(pid: string | number): Promise<Puzzle | null> {
  const response = await fetch(`https://eternagame.org/get/?type=puzzle&nid=${pid}`, {
    method: 'GET',
  });
  const result = await response.json();

  if (!result?.data?.puzzle) {
    return null;
  }

  return result.data.puzzle satisfies Puzzle;
}
