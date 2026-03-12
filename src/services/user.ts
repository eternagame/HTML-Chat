export async function getUserInfo(uid: string | number) {
  const response = await fetch(`https://eternagame.org/get/?type=user&uid=${uid}`, {
    method: 'GET',
  });
  return response.json();
}
