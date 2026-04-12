import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'procedure',

      input: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            channelTid: { type: 'string', format: 'tid' },
            body: { type: 'string' }
          }
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'ref',
              ref: 'at.ducs.channels.defs#message'
            }
          }
        }
      }
    },
  }
}