import { Lexicon, Route } from '@lib/routes';
import * as fish from '@lexicons/fish';
import { HTTPException } from 'hono/http-exception';
import { DB, db } from '@lib/db';
import { tid } from '@lib/tid';
import { decodeAccessToken, generateAccessToken } from '@lib/oauth/tokens';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' }
          },
          required: ['accessToken']
        }
      }
    }
  }
}

export const route: Route<fish.msg.duc.oauth.getAccessToken.$Output> = async (c) => {
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

  console.log(await decodeAccessToken(accessToken));

  return c.json({
    encoding: 'application/json',
    body: {
      accessToken
    }
  })
}