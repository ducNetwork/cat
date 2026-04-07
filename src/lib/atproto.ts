import { createDidResolver, createHandleResolver, Did } from '@atproto/oauth-client-node';

export async function resolveDid(did: Did) {
  const doc = await createDidResolver({}).resolve(did);
  if (!doc) return null;

  return doc;
}

export async function resolveDidByHandle(handle: string) {
  const did = await createHandleResolver({ handleResolver: 'https://public.api.bsky.app' }).resolve(handle);
  if (!did) return null;

  return resolveDid(did);
}