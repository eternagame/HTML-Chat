import type { TODO } from '#models';

export async function getPuzzleInfo(pid: string | number): Promise<TODO<unknown>> {
  const response = await fetch(`https://eternagame.org/get/?type=puzzle&nid=${pid}`, {
    method: 'GET',
  });
  return response.json();
}
