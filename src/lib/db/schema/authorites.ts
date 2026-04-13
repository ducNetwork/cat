import { UriString } from '@atproto/lex';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const authorities = pgTable("authorities", {
  host: varchar().$type<UriString>().primaryKey(),
});