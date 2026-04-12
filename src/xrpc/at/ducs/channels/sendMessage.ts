import * as at from '@lexicons/at';
import { DB, db } from '@lib/db';
import { $lex } from '@lib/lexicons';
import { Auth } from '@lib/oauth/session';
import { Route } from '@lib/routes';
import { tid } from '@lib/tid';
import { HTTPException } from 'hono/http-exception';

export const route: Route<at.ducs.channels.sendMessage.$Output> = async (c) => {
  const auth = await Auth(c);
  const body = $lex(at.ducs.channels.sendMessage.$input.schema, await c.req.json());

  const membership = await db.query.channelMemberships.findFirst({
    where: {
      userDid: auth.did,
      channelTid: body.channelTid
    },
    with: {
      channel: true
    }
  });
  if (!membership) throw new HTTPException(403, { message: 'InvalidChannel' });

  const [message] = await db
    .insert(DB.messages)
    .values({
      tid: tid.generate(),
      authorDid: auth.did,
      channelTid: membership.channelTid,
      body: body.body
    })
    .returning();
  
  return c.json({
    encoding: 'application/json',
    body: {
      message: {
        tid: message.tid,
        authorDid: message.authorDid ?? undefined,
        channelTid: message.channelTid,
        body: message.body ?? undefined
      }
    }
  })
}
