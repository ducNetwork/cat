import { Route } from '@lib/routes';
import * as fish from '@lexicons/fish';
import { $lex } from '@lib/lexicons';
import { getOAuthClient } from '@lib/oauth/client';
import { DB, db } from '@lib/db';
import { resolveDid } from '@lib/atproto';
import { HTTPException } from 'hono/http-exception';
import crypto from 'node:crypto';
import { tid } from '@lib/tid';
import { generateAccessToken } from '@lib/oauth/tokens';

export const route: Route<fish.msg.duc.oauth.callback.$Output> = async (c) => {
  const query = $lex(fish.msg.duc.oauth.callback.$params, c.req.query());

  const client = await getOAuthClient();
  const authorization = await client.callback(new URLSearchParams(query));

  const doc = await resolveDid(authorization.session.did);
  if (!doc) throw new HTTPException(404, { message: 'invalidSession' });

  const did = doc.id;
  const handle = doc.alsoKnownAs?.[0].replace('at://', '');
  if (!handle) throw new HTTPException(404, { message: 'invalidSession' });

  await db
    .insert(DB.users)
    .values({
      did,
      handle
    })
    .onConflictDoNothing();
  
  const authId = tid.generate();
  await db
    .insert(DB.auth_settings)
    .values({
      userDid: did,
      authId
    });

  const refreshToken = crypto.randomBytes(32).toString('hex');
  await db
    .insert(DB.auth_sessions)
    .values({
      token: refreshToken,
      userDid: did
    });

  const accessToken = await generateAccessToken({
    sub: did,
    authId
  });

  return c.json({
    encoding: 'application/json',
    body: {
      refreshToken,
      accessToken
    }
  })
}