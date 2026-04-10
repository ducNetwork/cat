import { Route } from '@lib/routes';
import * as at from '@lexicons/at';
import { Auth } from '@lib/oauth/session';
import { $lex } from '@lib/lexicons';
import { DB, db } from '@lib/db';
import { HTTPException } from 'hono/http-exception';
import { and, eq, or } from 'drizzle-orm';
import { DidString } from '@atproto/lex';

export const route: Route<at.ducs.relationships.setRelationship.$Output> = async (c) => {
  const fromId = await Auth(c);
  const body = $lex(at.ducs.relationships.setRelationship.$input.schema, await c.req.json());

  const toId = body.userId.startsWith('did:plc:')
    ? { did: body.userId as DidString }
    : { handle: body.userId }
  
  const toUser = await db.query.users.findFirst({
    where: toId
  });
  if (!toUser) throw new HTTPException(404, { message: 'userNotFound' });

  const existingRelationship = await db.query.relationships.findFirst({
    where: {
      fromDid: fromId.did,
      to: toId
    }
  });

  if (
    (existingRelationship && existingRelationship.type === body.type) ||  // equal relationship, OR
    (!existingRelationship && body.type === 'unrelated')                  // already unrelated
  ) {
    throw new HTTPException(208, { message: 'relationshipNotUpdated' });
  }

  let relationship: at.ducs.relationships.setRelationship.$OutputBody | null = null;

  const foreignRelationship = await db.query.relationships.findFirst({
    where: {
      fromDid: toUser.did,
      toDid: fromId.did
    }
  });

  switch (body.type) {
    case 'unrelated':
      // delete sender -> recipient
      await db
        .delete(DB.relationships)
        .where(
          and(
            eq(DB.relationships.fromDid, fromId.did),
            eq(DB.relationships.toDid, toUser.did)
          )
        );
      
      // delete recipient -> send if friends
      if (foreignRelationship?.type === 'friend') await db
        .delete(DB.relationships)
        .where(
          and(
            eq(DB.relationships.fromDid, toUser.did),
            eq(DB.relationships.toDid, fromId.did),
            eq(DB.relationships.type, 'friend')
          )
        );
      
      relationship = {
        did: toUser.did,
        type: 'unrelated',
        status: 'active'
      }

      break;
    
    case 'friend':
      const wasPending = foreignRelationship?.type === 'friend' && foreignRelationship?.status === 'pending';
      const isBlocked = foreignRelationship?.type === 'blocked';

      // create relationship
      await db
        .insert(DB.relationships)
        .values({
          fromDid: fromId.did,
          toDid: toUser.did,
          type: 'friend',
          status: wasPending ? 'active' : 'pending'
        })
        .onConflictDoUpdate({
          target: [DB.relationships.fromDid, DB.relationships.toDid],
          set: {
            type: 'friend',
            status: wasPending ? 'active' : 'pending'
          },
        });
      
      // update foreign relationship if already pending
      if (wasPending && !isBlocked) {
        await db
          .update(DB.relationships)
          .set({
            status: 'active'
          })
          .where(
            and(
              eq(DB.relationships.fromDid, toUser.did),
              eq(DB.relationships.toDid, fromId.did),
            )
          );
      }

      relationship = {
        did: toUser.did,
        type: 'friend',
        status: wasPending ? 'active' : 'pending'
      }

      break;

    case 'blocked':
      const wasFriend = foreignRelationship?.type === 'friend' && foreignRelationship.status === 'active';

      // create relationship
      await db
        .insert(DB.relationships)
        .values({
          fromDid: fromId.did,
          toDid: toUser.did,
          type: 'blocked',
          status: 'active'
        })
        .onConflictDoUpdate({
          target: [DB.relationships.fromDid, DB.relationships.toDid],
          set: {
            type: 'blocked',
            status: 'active'
          },
        });
      
      if (wasFriend) {
        await db
          .delete(DB.relationships)
          .where(
            and(
              eq(DB.relationships.fromDid, toUser.did),
              eq(DB.relationships.toDid, fromId.did),
              eq(DB.relationships.type, 'friend')
            )
          );
      }

      relationship = {
        did: toUser.did,
        type: 'blocked',
        status: 'active'
      }

      break;
  }

  if (!relationship) throw new HTTPException(500, { message: 'relationshipUpdateFailed' })

  return c.json({
    encoding: 'application/json',
    body: relationship
  });
}