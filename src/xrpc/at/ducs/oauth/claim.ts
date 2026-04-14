import * as at from '@lexicons/at';

import { Route } from '@lib/routes';
import { HTTPException } from 'hono/http-exception';

export const redirectTokens = new Map<string, [string, string]>();

export const route: Route<at.ducs.oauth.claim.$Output> = async (c) => {
  const redirectToken = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!redirectToken) throw new HTTPException(401);

  const tokens = redirectTokens.get(redirectToken);
  if (!tokens) throw new HTTPException(404, { message: 'InvalidRedirectToken' });
  
  redirectTokens.delete(redirectToken);

  return c.json({
    encoding: 'application/json',
    body: {
      refreshToken: tokens[0],
      accessToken: tokens[1]
    }
  })
}