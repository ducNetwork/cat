import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'record',
      key: 'literal:self',
      record: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },

          avatar: {
            type: 'ref',
            ref: 'at.ducs.users.defs#avatar'
          }
        }
      }
    }
  }
}