import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { HTTPException } from 'hono/http-exception';
import { DB, db } from '@lib/db';
import { tid } from '@lib/tid';
import { generateAccessToken } from '@lib/oauth/tokens';

export const route: Route<at.ducs.oauth.refresh.$Output> = async (c) => {
  const refreshToken = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!refreshToken) throw new HTTPException(401);

  const auth_session = await db.query.auth_sessions.findFirst({
    where: { token: refreshToken },
    with: { user: true }
  });
  if (!auth_session) throw new HTTPException(401);

  const user = auth_session.user;

  const [auth_settings] = await db
    .insert(DB.auth_settings)
    .values({
      userDid: user.did,
      authId: tid.generate()
    })
    .onConflictDoNothing()
    .returning();
  
  const accessToken = await generateAccessToken({
    sub: user.did,
    authId: auth_settings.authId
  });

  return c.json({
    encoding: 'application/json',
    body: {
      accessToken
    }
  })
}