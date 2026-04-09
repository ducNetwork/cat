import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      parameters: {
        type: 'params',
        properties: {
          did: { type: 'string', format: 'did' },
          handle: { type: 'string', format: 'handle' }
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            user: {
              type: 'ref',
              ref: 'fish.msg.duc.users.defs#user'
            }
          },
          required: ['user']
        }
      },

      errors: [
        { name: 'profileNotFound' }
      ]
    }
  }
}