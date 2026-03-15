import { USER_ROLES } from '#constants';
import type { UserProfile } from '#models';
import log from 'loglevel';

export async function getUserProfile(uid: string): Promise<UserProfile> {
  let user: Record<string, unknown> | null = null;

  if (uid !== '0' && uid !== 'anon') {
    const response = await fetch(`https://eternagame.org/get/?type=user&uid=${uid}`, {
      method: 'GET',
    });
    const result = await response.json().catch((err) => {
      log.error(err);
      return null;
    });
    user = result?.data?.user ?? null;
  }

  const roles: string[] = [];
  if (user && typeof user.name === 'string') {
    Object.entries(USER_ROLES).forEach(([role, usernames]) => {
      if (
        usernames.some(
          (username) => username.toLocaleLowerCase() === (user.name as string).toLocaleLowerCase(),
        )
      ) {
        roles.push(role);
      }
    });
  }
  roles.push('Player');

  return {
    avatar: user?.picture ? `https://eternagame.org/${user.picture}` : null,
    rank: (user?.rank ?? null) as number | null,
    description: typeof user?.Profile === 'string' && user.Profile.length > 0 ? user.Profile : null,
    roles,
    link: user?.uid ? `https://eternagame.org/players/${user.uid}` : null,
  };
}
