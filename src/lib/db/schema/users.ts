import { pgEnum, pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';
import { authorities } from './authorites';
import { DidString, UriString } from '@atproto/lex';

export const users = pgTable("users", {
  did: varchar().$type<DidString>().primaryKey(),
  handle: varchar().notNull(),
  displayName: varchar(),
  avatar: varchar().$type<UriString>(),
  homeHost: varchar().references(() => authorities.host),

  indexedAt: timestamp(),
});

export const relationshipType = pgEnum("relationshipType", ['friend', 'blocked']);
export const relationshipStatus = pgEnum("relationshipStatus", ['pending', 'active']);

export const relationships = pgTable("relationships", {
  type: relationshipType().notNull(),
  status: relationshipStatus().notNull(),

  fromDid: varchar().$type<DidString>().notNull().references(() => users.did),
  toDid: varchar().$type<DidString>().notNull().references(() => users.did),
}, (t) => [
  primaryKey({ columns: [t.fromDid, t.toDid] })
]);