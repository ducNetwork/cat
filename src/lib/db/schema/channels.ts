import { DidString, TidString } from '@atproto/lex';
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

export const channels = pgTable('channels', {
  tid: varchar().$type<TidString>().notNull(),
  name: varchar(),

  parentTid: varchar().$type<TidString>(),
});

export const channelMembershipStatus = pgEnum('channelMembershipStatus', ['pending', 'active']);

export const channelMemberships = pgTable('channelMemberships', {
  channelTid: varchar().$type<TidString>().notNull(),
  userDid: varchar().$type<DidString>().notNull(),

  status: channelMembershipStatus().notNull().default('active'),
})