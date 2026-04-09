import { Route } from '@lib/routes';
import * as fish from '@lexicons/fish';
import { $lex } from '@lib/lexicons';
import { Auth } from '@lib/oauth/session';
import { getOAuthClient } from '@lib/oauth/client';
import { Agent, BlobRef } from '@atproto/api';
import { HTTPException } from 'hono/http-exception';
import { getProfile, setProfile } from '../actor/profile.func';

const ACCEPTED_MIME = ['image/png', 'image/jpeg'];

export const scopes = [
  'repo:fish.msg.duc.actor.profile'
];

export const route: Route<fish.msg.duc.users.updateProfile.$Output> = async (c) => {
  const auth = await Auth(c);
  const body = $lex(fish.msg.duc.users.updateProfile.$input.schema, await c.req.json());

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

  const record = fish.msg.duc.actor.profile.$build({
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
    body: record
  })
}