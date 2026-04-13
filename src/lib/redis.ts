import { AtIdentifierString, DidString, HandleString } from '@atproto/lex';
import { db, DB } from './db';
import { env } from './env';
import { RedisClient } from 'bun';
import * as at from '@lexicons/at';
import { eq } from 'drizzle-orm';

function createRedisClient() {
  return new RedisClient(env.CAT_REDIS_URL);
}

export interface DUC_newMessage {
  type: 'at.ducs.streams.eventMessages#createMessage'
  data: {
    message: {
      text: string
    }
  }
}

export interface DUC_deleteMessage {
  type: 'at.ducs.streams.eventMessages#deleteMessage'
  data: {
    messageTid: string
  }
}

export interface DUC_joinedChannel {
  type: 'at.ducs.streams.eventMessages#joinChannel'
  data: {
    channelTid: string,
    member: typeof DB.users.$inferSelect
  }
}

export interface DUC_leftChannel {
  type: 'at.ducs.streams.eventMessages#leaveChannel'
  data: {
    channelTid: string,
    memberTid: string
  }
}

export type MessageTypes = 
  DUC_newMessage | 
  DUC_deleteMessage | 
  DUC_joinedChannel | 
  DUC_leftChannel

export type MessageTypeNames = MessageTypes['type'];

export type Message<T extends MessageTypeNames> = {
  type: T
} & MessageTypes

export class RedisPublisher {
  readonly client = createRedisClient();

  publish<T extends MessageTypeNames>(channel: string, type: T, data: Message<T>['data']): Promise<number> {
    return this.client.publish(channel, JSON.stringify({ type, data }));
  }

  async setKeys(
    data: {
      [k in string]: string
    }
  ) {
    for (const [key, value] of Object.entries(data)) {
      await this.client.set(
        key, value,
        'EX', env.CAT_PROFILE_REDIS_TTL
      );
    }
  }

  async cacheProfile(profile: at.ducs.users.defs.Profile) {
    await this.setKeys({
      [`profile/${profile.did}`]: JSON.stringify(profile),
      [`profile/${profile.handle}`]: JSON.stringify(profile),
    });

    await db
      .update(DB.users)
      .set({
        ...profile,
        indexedAt: new Date()
      })
      .where(eq(DB.users.did, profile.did));
  }

  async getProfile(id: AtIdentifierString): Promise<at.ducs.users.defs.Profile | null> {
    // check for cached profile
    const redisProfile = await this.client.get(`profile/${id}`);
    if (redisProfile) return JSON.parse(redisProfile) as at.ducs.users.defs.Profile;

    // check for saved profile
    const databaseProfile = await db.query.users.findFirst({
      where: id.startsWith('did:plc:')
        ? { did: id as DidString }
        : { handle: id as HandleString }
    });

    // only return DB profile if within TTL
    if (
      databaseProfile && 
      (databaseProfile.indexedAt.getTime() + (env.CAT_PROFILE_INDEX_TTL * 1000)) > Date.now()
    ) {
      return databaseProfile;
    }

    // return null if not found
    return null;
  }
}

export const redis = new RedisPublisher();

export const sub = createRedisClient();