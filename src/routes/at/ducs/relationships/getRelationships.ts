import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { Auth } from '@lib/oauth/session';
import { db } from '@lib/db';

export const route: Route<at.ducs.relationships.getRelationships.$Output> = async (c) => {
  const auth = await Auth(c);

  const relationships = await db.query.relationships.findMany({
    where: {
      fromDid: auth.did
    }
  });

  return c.json({
    encoding: 'application/json',
    body: {
      relationships: relationships.map(r => ({
        did: r.toDid,
        type: r.type,
        status: r.status
      }))
    }
  });
}