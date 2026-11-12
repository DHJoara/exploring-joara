import path from 'path'
import type { CollectionConfig } from 'payload'

export const SiteImages: CollectionConfig = {
  slug: 'site_images',
  labels: { singular: 'Site Image', plural: 'Site Images' },
  admin: {
    group: 'Website',
    description: 'Images used for site specific.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    crop: false,
    focalPoint: false,
    staticDir: path.resolve('site_images'),
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', label: 'Alternative text', type: 'text' }],
}
