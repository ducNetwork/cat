import { AtIdentifierString, CidString, DidString, HandleString, UriString } from '@atproto/lex';
import { AtprotoIdentityDidMethods, DidDocument } from '@atproto/oauth-client-node';
import { resolveDid, resolveDidByHandle } from '@lib/atproto';
import { getProfileRecord } from '../actor/profile.util';
import { redis } from '@lib/redis';
import * as at from '@lexicons/at';

export function buildAvatarUri(did: DidString, cid: CidString): UriString {
  return `https://cdn.bsky.app/img/avatar/plain/${did}/${cid}@jpeg`;
}

export async function getProfile(id: AtIdentifierString): Promise<at.ducs.users.defs.Profile | null> {
  const isDid = id.startsWith('did:plc:');

  // check for cached profile
  const cachedProfile = await redis.getProfile(id);
  if (cachedProfile) return cachedProfile;

  // get DID document by ID
  const doc = isDid
    ? await resolveDid(id as DidString)
    : await resolveDidByHandle(id);
  if (!doc) return null;

  // extract DID and handle
  const did = doc.id;
  const handle = !isDid
    ? id as HandleString
    : await resolveHandleByDidDoc(doc);
  if (!handle) return null;

  // build partial profile
  let profile = at.ducs.users.defs.profile.$build({
    did,
    handle,
    displayName: null,
    avatar: null
  })

  // lookup profile, return partial if not found
  const profileRecord = await getProfileRecord(doc);
  if (!profileRecord) return profile;

  // build full profile
  profile = {
    ...profile,

    displayName: profileRecord.displayName ?? null,
    avatar: profileRecord.avatar
      ? buildAvatarUri(did, profileRecord.avatar.ref.toString())
      : null
  };

  // cache profile
  await redis.cacheProfile(profile);

  return profile;
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