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
            name: { type: 'string' },
            members: { 
              type: 'array', 
              items: { type: 'string', format: 'at-identifier' } 
            }
          },
          required: ['name', 'members']
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'ref',
          ref: 'at.ducs.channels.defs#channel'
        }
      }
    }
  }
}