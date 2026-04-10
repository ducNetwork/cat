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
            userId: { type: 'string', format: 'at-identifier' },
            type: {
              type: 'ref',
              ref: 'at.ducs.relationships.setRelationship#type'
            }
          },
          required: ['userId', 'type']
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'ref',
          ref: 'at.ducs.relationships.defs#relationship'
        }
      },

      errors: [
        { name: 'relationshipUpdateFailed' },
        { name: 'relationshipNotUpdated' },
        { name: 'userNotFound' }
      ]
    },

    type: {
      type: 'string',
      enum: ['friend', 'blocked', 'unrelated']
    }
  }
}