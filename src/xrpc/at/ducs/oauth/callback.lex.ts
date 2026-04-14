import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',
      
      parameters: {
        type: 'params',
        properties: {
          code: { type: 'string' },
          state: { type: 'string' },
          iss: { type: 'string' },

          error: { type: 'string' },
          error_description: { type: 'string' },
          error_uri: { type: 'string', format: 'uri' },
        },
        required: ['code', 'state']
      },

      errors: [
        { name: 'InvalidSession' },
        { name: 'InvalidState' }
      ]
    }
  }
}