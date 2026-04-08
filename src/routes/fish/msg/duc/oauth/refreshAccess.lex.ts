import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'query',

      output: {
        encoding: 'application/json',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' }
          },
          required: ['accessToken']
        }
      }
    }
  }
}