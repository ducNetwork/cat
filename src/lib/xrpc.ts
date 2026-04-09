import { Client } from '@atproto/lex';
import { env } from './env';

export const xrpc = new Client(env.AT_RESOLVER_URL);