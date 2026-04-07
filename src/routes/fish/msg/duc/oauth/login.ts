import { Lexicon, Route } from '@lib/routes';
import { $lex } from '@lib/lexicons';
import * as fish from '@lexicons/fish';
import { AT_OAUTH_SCOPE, getOAuthClient } from '@lib/oauth/client';
import z from 'zod';
import { UriString } from '@atproto/lex';
import { resolveDidByHandle } from '@lib/atproto';
import { env } from '@lib/env';
import { HTTPException } from 'hono/http-exception';
import { resolveAuthorityByDid } from '../authority/home.func';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      parameters: {
        type: 'params',
        properties: {
          handle: { type: 'string' },
          redirect_uri: { type: 'string', format: 'uri' }
        },
        required: ['handle', 'redirect_uri']
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            href: { type: 'string', format: 'uri' }
          },
          required: ['href']
        }
      },
      
      errors: [
        { name: 'userNotFound', description: "The specified user couldn't be found" },
        { name: 'userAlreadyHasHome', description: "The specified user already has a home authority" }
      ]
    }
  }
}

export const scopes = [
  "repo:fish.msg.duc.authority.home"
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

  if (authority && authority.host !== env.SERVER_URL) {
    throw new HTTPException(403, { message: 'userAlreadyHasHome' });
  }

  const client = await getOAuthClient();

  const ac = new AbortController();
  const url = await client.authorize(query.handle, {
    signal: ac.signal,
    scope: AT_OAUTH_SCOPE,
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