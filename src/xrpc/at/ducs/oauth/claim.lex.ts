import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'procedure',

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string' },
            accessToken: { type: 'string' }
          }
        }
      },

      errors: [
        { name: 'InvalidRedirectToken' }
      ]
    }
  }
}