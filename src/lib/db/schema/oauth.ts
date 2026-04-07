import { NodeSavedSession, NodeSavedState } from '@atproto/oauth-client-node';
import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auth_settings = pgTable("auth_settings", {
  userDid: varchar().notNull().references(() => users.did, { onDelete: 'cascade', onUpdate: 'cascade' }),

  authId: varchar().notNull()
});

export const auth_sessions = pgTable("auth_sessions", {
  userDid: varchar().notNull().references(() => users.did, { onDelete: 'cascade', onUpdate: 'cascade' }),

  token: varchar().primaryKey(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const atproto_auth_states = pgTable("atproto_auth_states", {
  key: varchar().primaryKey(),
  data: jsonb().$type<NodeSavedState>().notNull(),
});

export const atproto_auth_session = pgTable("atproto_auth_sessions", {
  did: varchar().primaryKey(),
  data: jsonb().$type<NodeSavedSession>().notNull(),
});