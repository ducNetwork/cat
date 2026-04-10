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
            displayName: { type: 'string' },

            avatar: { 
              type: 'string',
              description: "An 'image/png' or 'image/jpeg' encoded as a base64 data URL"
            }
          },

          nullable: ['displayName', 'avatar']
        }
      },

      output: {
        encoding: 'application/json',
        schema: {
          type: 'ref',
          ref: 'at.ducs.users.defs#profile'
        }
      },

      errors: [
        { name: 'invalidAvatarData' },
        { name: 'avatarUploadFailed' },
        { name: 'profileUpdateFailed' },
      ]
    }
  }
}