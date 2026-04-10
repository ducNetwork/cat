import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      parameters: {
        type: 'params',
        properties: {
          ids: { type: 'string' }
        },
        required: ['ids']
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            profiles: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'at.ducs.users.defs#user'
              }
            },

            failed: {
              type: 'array',
              items: { type: 'string', format: 'at-identifier' }
            }
          }
        }
      }
    }
  }
}