import { HTTPException } from 'hono/http-exception';
import crypto from 'node:crypto';

import * as at from '@lexicons/at';

import { Route } from '@lib/routes';
import { $lex } from '@lib/lexicons';
import { DB, db } from '@lib/db';
import { resolveDid } from '@lib/atproto';
import { getOAuthClient } from '@lib/oauth/client';
import { generateAccessToken } from '@lib/oauth/tokens';
import { tid } from '@lib/tid';

import { setAuthorityByDid } from '../actor/home.util';
import { resolveHandleByDidDoc } from '../users/getProfiles.util';
import { redirectTokens } from './claim';

interface AuthorizationState {
  redirect_uri?: string
}

export const route: Route = async (c) => {
  const query = $lex(at.ducs.oauth.callback.$params, c.req.query());

  const client = await getOAuthClient();
  const authorization = await client.callback(new URLSearchParams(query));
  if (!authorization.state) throw new HTTPException(400, { message: 'InvalidState' });

  const state: AuthorizationState = JSON.parse(authorization.state);
  if (!state.redirect_uri) throw new HTTPException(400, { message: 'InvalidState' });

  const doc = await resolveDid(authorization.session.did);
  if (!doc) throw new HTTPException(404, { message: 'InvalidSession' });

  const did = doc.id;
  const handle = await resolveHandleByDidDoc(doc);
  if (!handle) throw new HTTPException(404, { message: 'InvalidSession' });

  await db
    .insert(DB.users)
    .values({
      did,
      handle,
      indexedAt: new Date()
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

  await setAuthorityByDid(did);

  const accessToken = await generateAccessToken({
    sub: did,
    authId
  });

  // generate and send redirectToken
  const redirectToken = crypto.randomBytes(32).toString('hex');

  redirectTokens.set(redirectToken, [refreshToken, accessToken]);

  const redirect = new URL(state.redirect_uri);
  redirect.searchParams.set('token', redirectToken);

  return c.redirect(redirect, 303);
}