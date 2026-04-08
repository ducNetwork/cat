import { buildAtprotoLoopbackClientId, JoseKey, NodeOAuthClient, NodeSavedSession, NodeSavedState } from '@atproto/oauth-client-node';
import { env } from '@lib/env';
import { db } from '../db';
import { atproto_auth_session } from '@lib/db/schema/oauth';
import { atproto_auth_states } from '@lib/db/schema/oauth';
import { eq } from 'drizzle-orm';
import { scopes } from './scopes';
import { getJWK } from './tokens';

export const AT_OAUTH_SCOPE = [
  'atproto',
  ...scopes.scopes
].join(' ');

export const OAUTH_REDIRECT_URI = new URL(env.AT_OAUTH_CALLBACK, env.SERVER_URL).toString();

let client: NodeOAuthClient | null = null;

export async function getOAuthClient(): Promise<NodeOAuthClient> {
  if (client) return client;

  const isLocal = env.SERVER_URL.startsWith('http:');

  console.log('SCOPES: ' + AT_OAUTH_SCOPE.replaceAll(' ', ', '));

  client = new NodeOAuthClient({
    clientMetadata: {
      client_name: env.CAT_NAME,
      client_id: isLocal
        ? buildAtprotoLoopbackClientId({
            scope: AT_OAUTH_SCOPE,
            redirect_uris: [ OAUTH_REDIRECT_URI ],
          })
        : new URL('/.well-known/atproto-oauth-meta.json', env.SERVER_URL).toString(),
      scope: AT_OAUTH_SCOPE,
      redirect_uris: [ OAUTH_REDIRECT_URI ],
      response_types: ["code"],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: isLocal ? "none" : "private_key_jwt",
      token_endpoint_auth_signing_alg: isLocal ? undefined : "ES256",
      application_type: isLocal ? "native" : "web",
      dpop_bound_access_tokens: true,
      jwks: {
        keys: Object.values(await getJWK())
      }
    },

    keyset: isLocal
      ? undefined
      : await Promise.all([ 
        JoseKey.fromJWK(
          JSON.stringify((await getJWK()).privKey)
        )
      ]),
  
    stateStore: {
      async get(key: string) {
        const state = (await db
          .select()
          .from(atproto_auth_states)
          .where(eq(atproto_auth_states.key, key))
          .limit(1)
        )[0];

        return state.data;
      },

      async set(key: string, data: NodeSavedState) {
        await db
          .insert(atproto_auth_states)
          .values({ key, data })
          .onConflictDoUpdate({
            target: atproto_auth_states.key,
            set: { data }
          });
      },

      async del(key: string) {
        await db
          .delete(atproto_auth_states)
          .where(eq(atproto_auth_states.key, key));
      },
    },

    sessionStore: {
      async get(key: string) {
        const state = (await db
          .select()
          .from(atproto_auth_session)
          .where(eq(atproto_auth_session.did, key))
          .limit(1)
        )[0];

        return state.data;
      },

      async set(key: string, data: NodeSavedSession) {
        await db
          .insert(atproto_auth_session)
          .values({ did: key, data })
          .onConflictDoUpdate({
            target: atproto_auth_session.did,
            set: { data }
          });
      },

      async del(key: string) {
        await db
          .delete(atproto_auth_session)
          .where(eq(atproto_auth_session.did, key));
      },
    },
  });

  return client;
}