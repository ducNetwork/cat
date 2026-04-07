import { pgEnum, pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';
import { authorities } from './authorites';

export const users = pgTable("users", {
  did: varchar().primaryKey(),
  handle: varchar().notNull(),

  authorityHost: varchar().references(() => authorities.host),
  indexedAt: timestamp(),
});

export const relationship_type = pgEnum("relationship_type", ['friend', 'blocked']);

export const relationships = pgTable("relationships", {
  type: relationship_type().notNull(),

  fromDid: varchar().notNull().references(() => users.did),
  toDid: varchar().notNull().references(() => users.did),
}, (t) => [
  primaryKey({ columns: [t.fromDid, t.toDid, t.type] })
]);