import z from 'zod';

const envSchema = z.object({
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
  
  SERVER_URL: new URL(
    (rawEnv.SERVER_SECURE ? 'https' : 'http')
    + '://'
    + rawEnv.SERVER_HOST
  ).toString(),

  OAUTH_JWK_ALG: "ES256"
};