import path from 'path'
import { ValidationError, type CollectionConfig } from 'payload'

export const Pictures: CollectionConfig = {
  slug: 'pictures',
  folders: true,
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve('pictures'),
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', label: 'Alternative text', type: 'text' }],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const folder = data && 'folder' in data ? data.folder : originalDoc?.folder
        if (!folder) {
          throw new ValidationError({
            errors: [{ path: 'folder', message: 'Choose a folder for this picture.' }],
          })
        }
        return data
      },
    ],
  },
}
