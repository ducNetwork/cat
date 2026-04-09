import { DB } from './db';
import { env } from './env';
import { RedisClient } from 'bun';

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
}

export const redis = new RedisPublisher();

export const sub = createRedisClient();