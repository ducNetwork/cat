import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    user: {
      type: 'object',
      properties: {
        did: { type: 'string', format: 'did' },
        handle: { type: 'string', format: 'handle' },
        displayName: { type: 'string' },
        avatar: { 
          type: 'ref',
          ref: 'fish.msg.duc.users.defs#avatar'
        }
      },
      required: ['did', 'handle']
    },

    avatar: {
      type: 'blob',
      accept: ['image/png', 'image/jpeg'],
      maxSize: 1000000,
      description: "Image to be displayed next to messages from a user"
    }
  }
}