import * as at from '@lexicons/at';

import { $lex } from '@lib/lexicons';
import { Route } from '@lib/routes';
import { HTTPException } from 'hono/http-exception';

export const redirectTokens = new Map<string, [string, string]>();

export const route: Route<at.ducs.oauth.claim.$Output> = async (c) => {
  const body = $lex(at.ducs.oauth.claim.$input.schema, await c.req.json());

  const tokens = redirectTokens.get(body.redirectToken);
  if (!tokens) throw new HTTPException(404, { message: 'InvalidRedirectToken' });

  return c.json({
    encoding: 'application/json',
    body: {
      refreshToken: tokens[0],
      accessToken: tokens[1]
    }
  })
}