import { Route } from '@lib/routes';
import * as fish from '@lexicons/fish';
import { $lex } from '@lib/lexicons';
import { HTTPException } from 'hono/http-exception';
import { resolveDid, resolveDidByHandle } from '@lib/atproto';
import { HandleString } from '@atproto/lex';
import { getProfile } from '../actor/profile.func';

// @ts-ignore TODO: figure out output type error
export const route: Route<fish.msg.duc.users.getUser.$Output> = async (c) => {
  const query = $lex(fish.msg.duc.users.getUser.$params, c.req.query());

  let user: fish.msg.duc.users.defs.User | null = null;

  if (query.did) {
    const did = query.did;

    const doc = await resolveDid(did);
    if (!doc) throw new HTTPException(404, { message: 'userNotFound' });

    const handle = doc.alsoKnownAs?.at(0)?.replace('at://', '') as HandleString;
    if (!handle) throw new HTTPException(404, { message: 'profileNotFound' });

    const profile = await getProfile(did);
    if (!profile) throw new HTTPException(404, { message: 'profileNotFound' });

    user = {
      did: doc.id,
      handle,
      avatar: profile.avatar,
      displayName: profile.displayName
    }
  } else if (query.handle) {
    const handle = query.handle;

    const doc = await resolveDidByHandle(handle);
    if (!doc) throw new HTTPException(404, { message: 'userNotFound' });

    const did = doc.id;

    const profile = await getProfile(did);
    if (!profile) throw new HTTPException(404, { message: 'profileNotFound' });

    user = {
      did: doc.id,
      handle,
      avatar: profile.avatar,
      displayName: profile.displayName
    }
  }

  if (!user) throw new HTTPException(404, { message: 'profileNotFound' });

  return c.json({
    encoding: 'application/json',
    body: {
      user
    }
  })
}