import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { $lex } from '@lib/lexicons';
import { getProfile } from './getProfiles.util';
import { AtIdentifierString } from '@atproto/lex';

export const route: Route<at.ducs.users.getProfiles.$Output> = async (c) => {
  const query = $lex(at.ducs.users.getProfiles.$params, c.req.query());

  const ids = query.ids.split(',') as AtIdentifierString[];

  let failed: AtIdentifierString[] = [];
  let profiles: at.ducs.users.defs.Profile[] = [];
  for (const id of ids) {
    const profile = await getProfile(id);

    if (!profile) failed.push(id);
    else {
      profiles.push(profile);
    }
  }

  return c.json({
    encoding: 'application/json',
    body: {
      profiles,
      failed
    }
  })
}