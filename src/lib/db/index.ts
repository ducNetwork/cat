import { defineRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@lib/env';
import { authorities } from './schema/authorites';
import { relationships, users } from './schema/users';
import { atproto_auth_session, atproto_auth_states, auth_sessions, auth_settings } from './schema/oauth';

const relations = defineRelations({
  atproto_auth_session,
  atproto_auth_states,
  auth_sessions,
  auth_settings,

  authorities,
  users,
  relationships
}, (r) => ({
  auth_sessions: {
    user: r.one.users({
      from: r.auth_sessions.userDid,
      to: r.users.did,
      optional: false
    })
  },

  auth_settings: {
    user: r.one.users({
      from: r.auth_settings.userDid,
      to: r.users.did,
      optional: false
    })
  }
}));

export const db = drizzle(env.CAT_DATABASE_URL, { relations });

export const DB = {
  atproto_auth_session,
  atproto_auth_states,
  auth_sessions,
  auth_settings,

  authorities,
  users,
  relationships
}