import z from 'zod';
import { normalizeUrl } from './url';

const envSchema = z.object({
  CAT_NAME: z.string(),

  CAT_URL: z.url().transform(u => normalizeUrl(u)),
  CAT_DATABASE_URL: z.string(),
  CAT_REDIS_URL: z.string(),
  CAT_JWK_PATH: z.string().optional(),

  AT_OAUTH_CALLBACK: z.string(),
  AT_RESOLVER_URL: z.url()
});

export type Env = z.infer<typeof envSchema>;

const rawEnv = envSchema.parse(Bun.env);

export const env = {
  ...rawEnv,

  JWK_ALG: "ES256"
};