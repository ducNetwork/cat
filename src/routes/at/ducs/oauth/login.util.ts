import z from 'zod';

export const catOAuthClientMetadataSchema = z.object({
  client_id: z.url(),
  client_name: z.string(),
  redirect_uris: z.array(z.string())
});