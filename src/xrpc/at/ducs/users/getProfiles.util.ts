import { AtIdentifierString, DidString, HandleString, UriString } from '@atproto/lex';
import { AtprotoIdentityDidMethods, DidDocument } from '@atproto/oauth-client-node';
import { resolveDid, resolveDidByHandle } from '@lib/atproto';
import { getProfileRecord } from '../actor/profile.util';

export async function getProfile(id: AtIdentifierString) {
  const isDid = id.startsWith('did:plc:');

  const doc = isDid
    ? await resolveDid(id as DidString)
    : await resolveDidByHandle(id);
  if (!doc) return null;

  const did = doc.id;
  const handle = !isDid
    ? id as HandleString
    : await resolveHandleByDidDoc(doc);
  if (!handle) return null;

  const profileRecord = await getProfileRecord(doc);
  if (!profileRecord) return null;

  return {
    did,
    handle,
    displayName: profileRecord.displayName,
    avatar: profileRecord.avatar
      ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileRecord.avatar.ref.toString()}@jpeg` as UriString
      : undefined
  }
}

export async function resolveHandleByDidDoc(doc: DidDocument<AtprotoIdentityDidMethods>) {
  const did = doc.id;

  for (const aka in doc.alsoKnownAs) {
    if (aka.startsWith('at://')) {
      const handle = aka.replace('at://', '') as HandleString;
      const isValid = await validateHandle(did, handle);

      if (isValid) return handle;
    }
  }

  return null;
}

export async function validateHandle(did: DidString, handle: HandleString) {
  const doc = await resolveDidByHandle(handle);
  if (!doc) return false;

  return doc.id === did;
}