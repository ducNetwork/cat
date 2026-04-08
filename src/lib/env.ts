import { UriString } from '@atproto/lex';
import z from 'zod';
import { normalizeUrl } from './url';

const envSchema = z.object({
  CAT_NAME: z.string(),

  SERVER_SECURE: z.string().transform(s => JSON.parse(s) as boolean),
  SERVER_HOST: z.string(),
  SERVER_DATABASE_URL: z.string(),
  SERVER_REDIS_URL: z.string(),

  AT_OAUTH_JWK_PATH: z.string().optional(),
  AT_OAUTH_CALLBACK: z.string(),
});

export type Env = z.infer<typeof envSchema>;

const rawEnv = envSchema.parse(Bun.env);

export const env = {
  ...rawEnv,
  
  SERVER_URL: normalizeUrl(
    (rawEnv.SERVER_SECURE ? 'https' : 'http')
    + '://'
    + rawEnv.SERVER_HOST
  ) as UriString,

  JWK_ALG: "ES256"
};