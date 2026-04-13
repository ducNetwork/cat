import z from 'zod';
import { normalizeUrl } from './url';

const envSchema = z.object({
  CAT_NAME: z.string(),

  CAT_URL: z.url().transform(u => normalizeUrl(u)),
  CAT_DATABASE_URL: z.string(),
  CAT_REDIS_URL: z.string(),
  CAT_JWK_PATH: z.string().optional(),
  CAT_BLOB_PATH: z.string().default('./blobs'),
  CAT_ACCEPT_BLOBTYPE: z.string()
    .transform(s => s.replaceAll(', ', ',').split(','))
    .default(['image/png=png', 'image/jpeg=jpg/jpeg']),

  CAT_PROFILE_INDEX_TTL: z.number().default(300), // seconds
  CAT_PROFILE_REDIS_TTL: z.number().default(120), // seconds

  AT_OAUTH_CALLBACK: z.string(),
  AT_RESOLVER_URL: z.url()
});

export type Env = z.infer<typeof envSchema>;

const rawEnv = envSchema.parse(Bun.env);

export const env = {
  ...rawEnv,

  CAT_ACCEPT_MIMETYPE: rawEnv.CAT_ACCEPT_BLOBTYPE.map(t => t.split('=')[0]),
  CAT_ACCEPT_EXT: rawEnv.CAT_ACCEPT_BLOBTYPE.map(t => t.split('=')[1].split('/')).flat(),
  JWK_ALG: "ES256"
};