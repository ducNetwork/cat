import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'record',
      key: 'literal:self',
      record: {
        type: 'object',
        properties: {
          host: { type: 'string', format: 'uri' }
        },
        required: ['host']
      }
    }
  }
}