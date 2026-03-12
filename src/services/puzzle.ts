export async function getPuzzleInfo(pid: string | number) {
  const response = await fetch(`https://eternagame.org/get/?type=puzzle&nid=${pid}`, {
    method: 'GET',
  });
  return response.json();
}
