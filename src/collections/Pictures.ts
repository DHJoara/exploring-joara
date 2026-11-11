import path from 'path'
import type { CollectionConfig } from 'payload'

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
    crop: false,
    focalPoint: false,
    staticDir: path.resolve('pictures'),
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', label: 'Alternative text', type: 'text' }],
}
