import { DidString, TidString } from '@atproto/lex';
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const channels = pgTable('channels', {
  tid: varchar().$type<TidString>().primaryKey(),
  name: varchar(),

  parentTid: varchar().$type<TidString>(),
});

export const messages = pgTable('messages', {
  tid: varchar().$type<TidString>().primaryKey(),
  authorDid: varchar().$type<DidString>().references(() => users.did, { onDelete: 'set null', onUpdate: 'cascade' }),
  channelTid: varchar().$type<TidString>().notNull().references(() => channels.tid, { onDelete: 'cascade', onUpdate: 'cascade' }),

  body: varchar()
})

export const channelMembershipStatus = pgEnum('channelMembershipStatus', ['pending', 'active']);

export const channelMemberships = pgTable('channelMemberships', {
  channelTid: varchar().$type<TidString>().notNull(),
  userDid: varchar().$type<DidString>().notNull(),

  status: channelMembershipStatus().notNull().default('active'),
})