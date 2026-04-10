import { db } from '@lib/db';
import { Auth } from '@lib/oauth/session';
import { Route } from '@lib/routes';

import * as at from '@lexicons/at';

// @ts-ignore TODO: figure out output type error
export const route: Route<at.ducs.channels.getChannels.$Output> = async (c) => {
  const auth = await Auth(c);

  const memberships = await db.query.channelMemberships.findMany({
    where: {
      userDid: auth.did,
      status: 'active'
    },
    with: { 
      channel: true 
    }
  });

  return c.json({
    encoding: 'application/json',
    body: {
      channels: memberships.map(m => 
        at.ducs.channels.defs.channel.$build({
          tid: m.channel.tid,
          name: m.channel.name ?? undefined,
          parentTid: m.channel.parentTid ?? undefined
        })
      )
    }
  })
}