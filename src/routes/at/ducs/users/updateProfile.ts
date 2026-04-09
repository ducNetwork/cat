import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { $lex } from '@lib/lexicons';
import { Auth } from '@lib/oauth/session';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent, BlobRef } from '@atproto/api';
import { HTTPException } from 'hono/http-exception';
import { getProfile, setProfile } from '../actor/profile.util';

const ACCEPTED_MIME = ['image/png', 'image/jpeg'];

export const scopes = [
  'repo:at.ducs.actor.profile'
];

// @ts-ignore TODO: figure out output type error
export const route: Route<at.ducs.users.updateProfile.$Output> = async (c) => {
  const auth = await Auth(c);
  const body = $lex(at.ducs.users.updateProfile.$input.schema, await c.req.json());

  const client = await getOAuthClient();
  const session = await client.restore(auth.did);
  const agent = new Agent(session);

  let avatar: BlobRef | null = null;
  if (body.avatar) {
    const [meta, data] = body.avatar.split(',');

    const mimeMatch = meta.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : null;
    
    if (!mimeType || !ACCEPTED_MIME.includes(mimeType)) throw new HTTPException(400, { message: 'invalidAvatarData' });

    const buffer = Buffer.from(data, 'base64');

    const res = await agent.uploadBlob(buffer, { encoding: mimeType });
    if (!res.success) throw new HTTPException(500, { message: 'avatarUploadFailed' });

    avatar = res.data.blob;
  }

  const profile = await getProfile(auth.did);

  const record = at.ducs.actor.profile.$build({
    avatar: avatar
      ? {
        $type: 'blob',
        mimeType: avatar.mimeType,
        ref: avatar.ref,
        size: avatar.size
      }
      : avatar === null
        ? undefined
        : profile?.avatar,
        
    displayName: body.displayName
      ? body.displayName
      : body.displayName === null
        ? undefined
        : profile?.displayName
  });

  const updatedProfile = await setProfile(auth.did, record);
  if (!updatedProfile) throw new HTTPException(500, { message: 'profileUpdateFailed' });

  return c.json({
    encoding: 'application/json',
    body: {
      $type: 'at.ducs.actor.profile',
      displayName: record.displayName,
      avatar: record.avatar 
        ? {
          $type: 'blob',
          mimeType: record.avatar.mimeType,
          ref: record.avatar.ref,
          size: record.avatar.size
        }
        : undefined
    }
  })
}