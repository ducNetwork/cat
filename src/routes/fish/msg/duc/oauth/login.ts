import { Route } from '@lib/routes';
import { $lex } from '@lib/lexicons';
import * as fish from '@lexicons/fish';
import { getOAuthClient } from '@lib/oauth/client';
import z from 'zod';
import { UriString } from '@atproto/lex';
import { resolveDidByHandle } from '@lib/atproto';
import { env } from '@lib/env';
import { HTTPException } from 'hono/http-exception';
import { resolveAuthorityByDid } from '../authority/home.util';
import { globalScopes } from '@lib/oauth/scopes';

export const scopes = [
  "repo:fish.msg.duc.actor.home"
]

export const oauthStateSchema = z.object({
  redirect_uri: z.url()
});

export const route: Route<fish.msg.duc.oauth.login.$Output> = async (c) => {
  const query = $lex(fish.msg.duc.oauth.login.$params, c.req.query());

  const doc = await resolveDidByHandle(query.handle);
  const did = doc?.id;
  const endpoint = doc?.service?.find(s => s.id === '#atproto_pds')?.serviceEndpoint as string;

  if (!did || !endpoint) throw new HTTPException(404, { message: 'userNotFound' });

  const authority = await resolveAuthorityByDid(did, endpoint);

  if (authority && authority.cat !== env.CAT_URL) {
    throw new HTTPException(403, { message: 'userAlreadyHasHome' });
  }

  const client = await getOAuthClient();

  const ac = new AbortController();
  const url = await client.authorize(query.handle, {
    signal: ac.signal,
    scope: globalScopes.toString(),
    state: JSON.stringify(
      oauthStateSchema.parse({
        redirect_uri: query.redirect_uri
      })
    )
  });

  return c.json({
    encoding: 'application/json',
    body: { href: url.toString() as UriString }
  })
}