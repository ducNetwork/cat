import { OAuthSession } from '@atproto/oauth-client-node';
import { createMiddleware } from 'hono/factory';
import { getOAuthClient } from './client';
import { db, DB } from '../db';
import { Context } from 'hono';

export async function getATProtoSession(did: string): Promise<OAuthSession | null> {
  try {
    const client = await getOAuthClient();
    return await client.restore(did);
  } catch {
    return null;
  }
}

export interface AuthVariables {
  user: typeof DB.users.$inferSelect
  session: typeof DB.auth_sessions.$inferSelect
}

export function Auth() {
  return createMiddleware<{
    Variables: AuthVariables
  }>(async (c, next) => {
    const authorization = c.req.header('Authorization') ?? c.req.query('___authorization');
    if (!authorization) return c.text("No authorization token passed", 401);

    const token = authorization.replace("Bearer ", "");
    const session = await db.query.auth_sessions.findFirst({ 
      where: { token },
      with: { user: true }
    });
    if (!session) return c.text("Invalid authorization token", 401);

    c.set('session', session);
    c.set('user', session.user);

    return await next();
  });
}

export function getAuth(c: Context) {
  return c.var.user as typeof DB.users.$inferSelect;
}