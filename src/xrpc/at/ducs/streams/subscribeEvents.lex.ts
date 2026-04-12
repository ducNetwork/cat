import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    main: {
      type: 'subscription',

      message: {
        schema: {
          type: 'union',
          refs: [
            
          ]
        }
      }
    }
  }
}