import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    profile: {
      type: 'object',
      properties: {
        did: { type: 'string', format: 'did' },
        handle: { type: 'string', format: 'handle' },
        displayName: { type: 'string' },
        avatar: { type: 'string', format: 'uri' }
      },
      required: ['did', 'handle', 'displayName', 'avatar'],
      nullable: ['displayName', 'avatar']
    },

    avatar: {
      type: 'blob',
      accept: ['image/png', 'image/jpeg'],
      maxSize: 1000000,
      description: "Image to be displayed next to messages from a user"
    }
  }
}