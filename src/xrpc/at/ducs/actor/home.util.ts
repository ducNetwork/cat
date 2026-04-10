import { Agent } from '@atproto/api';
import { xrpc } from '@atproto/lex';
import { AtprotoIdentityDidMethods, Did, DidDocument } from '@atproto/oauth-client-node';
import * as com from '@lexicons/com';
import * as at from '@lexicons/at';
import { getATProtoSession } from '@lib/oauth/session';
import { env } from '@lib/env';
import { normalizeUrl } from '@lib/url';

export async function resolveAuthorityByDid(did: Did) {
  try {
    const res = await xrpc(env.AT_RESOLVER_URL, com.atproto.repo.getRecord, {
      params: {
        rkey: 'self',
        collection: 'at.ducs.actor.home',
        repo: did
      }
    });

    const doc = at.ducs.actor.home.$safeParse(res.body.value);
    if (!doc.success) return null;

    return {
      cat: normalizeUrl(doc.value.cat)
    }
  } catch (err) {
    return null;
  }
}

export function getPdsServiceEndpoint(doc: DidDocument<AtprotoIdentityDidMethods>) {
  return doc.service?.find(s => s.type === 'AtprotoPersonalDataServer')?.serviceEndpoint as string | undefined;
}

export async function setAuthorityByDid(did: Did) {
  const session = await getATProtoSession(did);
  if (!session) throw new Error("failed to recover session: " + did);

  const agent = new Agent(session);

  const record = at.ducs.actor.home.$build({
    cat: env.CAT_URL
  });

  await agent.com.atproto.repo.putRecord({
    rkey: 'self',
    collection: 'at.ducs.actor.home',
    repo: did,
    record
  });
}