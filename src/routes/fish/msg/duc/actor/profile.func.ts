import { AtIdentifierString, DidString } from '@atproto/lex';
import * as fish from '@lexicons/fish';
import * as com from '@lexicons/com';
import { xrpc } from '@lib/xrpc';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent } from '@atproto/api';

export async function getProfile(repo: AtIdentifierString) {
  try {
    const res = await xrpc.call(com.atproto.repo.getRecord, {
      collection: 'fish.msg.duc.actor.profile',
      rkey: 'self',
      repo
    });

    const validateProfile = fish.msg.duc.actor.profile.$safeParse(res);
    if (!validateProfile.success) return null;

    return validateProfile.value;
  } catch (err) {
    console.log(err)
    return null;
  }
}

export async function setProfile(did: DidString, record: fish.msg.duc.actor.profile.Main) {
  try {
    const client = await getOAuthClient();
    const session = await client.restore(did);
    const agent = new Agent(session);
    
    const res = await agent.com.atproto.repo.putRecord({
      collection: 'fish.msg.duc.actor.profile',
      repo: did,
      rkey: 'self',
      record
    });
    
    return res.success;
  } catch {
    return false;
  }
}