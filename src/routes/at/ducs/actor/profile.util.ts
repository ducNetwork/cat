import { AtIdentifierString, DidString, xrpc } from '@atproto/lex';
import * as at from '@lexicons/at';
import * as com from '@lexicons/com';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent } from '@atproto/api';
import { env } from '@lib/env';

const COLLECTION = 'at.ducs.actor.profile';
const RKEY = 'self';

export async function getProfile(repo: AtIdentifierString) {
  try {
    const res = await xrpc(env.AT_RESOLVER_URL, com.atproto.repo.getRecord, {
      params: {
        collection: COLLECTION,
        rkey: 'self',
        repo
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

export async function setProfile(did: DidString, record: at.ducs.actor.profile.Main) {
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