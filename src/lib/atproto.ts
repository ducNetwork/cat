import { AtprotoIdentityDidMethods, createDidResolver, createHandleResolver, Did, DidDocument } from '@atproto/oauth-client-node';
import { env } from './env';
import { resolveHandleByDidDoc } from '../xrpc/at/ducs/users/getProfiles.util';

export async function resolveDid(did: Did) {
  const doc = await createDidResolver({}).resolve(did);
  if (!doc) return null;

  return doc;
}

export async function resolveDidByHandle(handle: string) {
  const did = await createHandleResolver({ handleResolver: env.AT_RESOLVER_URL }).resolve(handle);
  if (!did) return null;

  return resolveDid(did);
}