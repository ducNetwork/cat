import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      parameters: {
        type: 'params',
        properties: {
          limit: { type: 'integer', default: 20 },
          beforeTid: { type: 'string', format: 'tid' }
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            channels: {
              type: 'ref',
              ref: 'at.ducs.channels.defs#channel'
            }
          },
          required: ['channels']
        }
      }
    }
  }
}