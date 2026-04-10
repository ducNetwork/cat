import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    channel: {
      type: 'object',
      properties: {
        tid: { type: 'string', format: 'tid' },
        name: { type: 'string' },
        parentTid: { type: 'string', format: 'tid' }
      },
      required: ['tid']
    }
  }
}