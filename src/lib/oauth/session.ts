import { OAuthSession } from '@atproto/oauth-client-node';
import { getOAuthClient } from './client';
import { Context } from 'hono';
import { verifyAccessToken } from './tokens';
import { HTTPException } from 'hono/http-exception';
import { DidString } from '@atproto/lex';

export async function getATProtoSession(did: string): Promise<OAuthSession | null> {
  try {
    const client = await getOAuthClient();
    return await client.restore(did);
  } catch {
    return null;
  }
}

export async function Auth(c: Context) {
  const authorization = c.req.header('Authorization');
  if (!authorization) throw new HTTPException(401);

  const token = authorization.replace("Bearer ", "");
  const payload = await verifyAccessToken(token);
  if (!payload) throw new HTTPException(401);

  return {
    did: payload.sub as DidString
  }
}