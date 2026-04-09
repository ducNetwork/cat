import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      parameters: {
        type: 'params',
        properties: {
          limit: { type: 'integer', default: 20 }
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            relationships: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'at.ducs.relationships.defs#relationship'
              }
            }
          }
        }
      }
    }
  }
}