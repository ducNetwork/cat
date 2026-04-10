import { AtIdentifierString, CidString, DidString, xrpc } from '@atproto/lex';
import * as at from '@lexicons/at';
import * as com from '@lexicons/com';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent } from '@atproto/api';
import { env } from '@lib/env';
import { resolveDid } from '@lib/atproto';
import { DidDocument } from '@atproto/oauth-client-node';

const COLLECTION = 'at.ducs.actor.profile';
const RKEY = 'self';

export async function getProfileRecord(doc: DidDocument) {
  const did = doc.id;
  const endpoint = doc.service?.find(s => s.id === '#atproto_pds')?.serviceEndpoint as string | undefined
  if (!endpoint) return null;

  try {
    const res = await xrpc(endpoint, com.atproto.repo.getRecord, {
      params: {
        collection: COLLECTION,
        rkey: 'self',
        repo: did
      }
    });

    const validateProfile = at.ducs.actor.profile.$safeParse(res.body.value);
    if (!validateProfile.success) return null;

    return validateProfile.value;
  } catch (err) {
    console.log(err)
    return null;
  }
}

export async function setProfileRecord(did: DidString, record: at.ducs.actor.profile.Main) {
  try {
    const client = await getOAuthClient();
    const session = await client.restore(did);
    const agent = new Agent(session);
    
    const res = await agent.com.atproto.repo.putRecord({
      collection: COLLECTION,
      rkey: RKEY,
      repo: did,
      record
    });
    
    return res.success;
  } catch {
    return false;
  }
}