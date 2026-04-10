import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { $lex } from '@lib/lexicons';
import { Auth } from '@lib/oauth/session';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent, BlobRef } from '@atproto/api';
import { HTTPException } from 'hono/http-exception';
import { getProfileRecord, setProfileRecord } from '../actor/profile.util';
import { env } from '@lib/env';
import { resolveDid } from '@lib/atproto';
import { buildAvatarUri, resolveHandleByDidDoc } from './getProfiles.util';
import { DB, db } from '@lib/db';
import { eq } from 'drizzle-orm';
import { redis, sub } from '@lib/redis';

export const scopes = [
  'repo:at.ducs.actor.profile',
  ...env.CAT_ACCEPT_MIMETYPE.map(t => 'blob:' + t)
];

export const route: Route<at.ducs.users.updateProfile.$Output> = async (c) => {
  const auth = await Auth(c);
  const body = $lex(at.ducs.users.updateProfile.$input.schema, await c.req.json());

  const client = await getOAuthClient();
  const session = await client.restore(auth.did);
  const agent = new Agent(session);

  let blob: BlobRef | null = null;
  if (body.avatar) {
    const [meta, data] = body.avatar.split(',');

    const mimeMatch = meta.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : null;
    
    if (!mimeType || !env.CAT_ACCEPT_MIMETYPE.includes(mimeType)) throw new HTTPException(400, { message: 'invalidAvatarData' });

    const buffer = Buffer.from(data, 'base64');

    const res = await agent.uploadBlob(buffer, { encoding: mimeType });
    if (!res.success) throw new HTTPException(500, { message: 'avatarUploadFailed' });

    blob = res.data.blob;
  }

  const doc = await resolveDid(auth.did);
  if (!doc) throw new HTTPException(500);

  const handle = await resolveHandleByDidDoc(doc);
  if (!handle) throw new HTTPException(500);

  const profileRecord = await getProfileRecord(doc);

  const record = at.ducs.actor.profile.$build({
    avatar: blob
      ? {
        $type: 'blob',
        mimeType: blob.mimeType,
        ref: blob.ref,
        size: blob.size
      }
      : blob === null
        ? undefined
        : profileRecord?.avatar,
        
    displayName: body.displayName
      ? body.displayName
      : body.displayName === null
        ? undefined
        : profileRecord?.displayName
  });

  const updatedProfile = await setProfileRecord(auth.did, record);
  if (!updatedProfile) throw new HTTPException(500, { message: 'profileUpdateFailed' });

  const avatar = record.avatar 
    ? buildAvatarUri(auth.did, record.avatar.ref.toString())
    : undefined

  const profile = {
    did: auth.did,
    handle,
    displayName: record.displayName,
    avatar
  }
  
  await redis.setProfile(profile);

  return c.json({
    encoding: 'application/json',
    body: profile
  })
}