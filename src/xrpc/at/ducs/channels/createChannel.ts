import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { Auth } from '@lib/oauth/session';
import { DB, db } from '@lib/db';
import { $lex } from '@lib/lexicons';
import { tid } from '@lib/tid';
import { DidString, HandleString } from '@atproto/lex';

export const route: Route<at.ducs.channels.createChannel.$Output> = async (c) => {
  const auth = await Auth(c);
  const body = $lex(at.ducs.channels.createChannel.$input.schema, await c.req.json());

  const [channel] = await db
    .insert(DB.channels)
    .values({
      name: body.name,
      tid: tid.generate()
    })
    .returning();
  
  const failedToResolve: string[] = [];
  for (const member of [auth.did, ...body.members]) {
    const memberId = member.startsWith('did:plc:')
      ? { did: member as DidString }
      : { handle: member as HandleString };
    
    const user = await db.query.users.findFirst({
      where: memberId
    });

    // skip if failed to resolve user
    if (!user) {
      failedToResolve.push(member);
      continue;
    }
    
    // send membership invite
    await db
      .insert(DB.channelMemberships)
      .values({
        channelTid: channel.tid,
        userDid: user.did,
        status: user.did === auth.did ? 'active' : 'pending'
      });
  }

  return c.json({
    encoding: 'application/json',
    body: {
      name: channel.name ?? undefined,
      tid: channel.tid,
      parentTid: channel.parentTid ?? undefined
    }
  })
}