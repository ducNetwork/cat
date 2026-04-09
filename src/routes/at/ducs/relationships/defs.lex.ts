import { Lexicon } from '@lib/routes';

export const lexicon: Lexicon = {
  defs: {
    relationship: {
      type: 'object',
      properties: {
        did: { type: 'string', format: 'did' },
        type: {
          type: 'ref',
          ref: 'at.ducs.relationships.setRelationship#type'
        },
        status: { type: 'string', enum: ['pending', 'active'] }
      }
    }
  }
}