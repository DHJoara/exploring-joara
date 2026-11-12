import type { CollectionConfig } from 'payload'
import { generateThumbnail } from '../endpoints/generateThumbnail'

export const Artifacts: CollectionConfig = {
  slug: 'artifacts',
  endpoints: [{ path: '/thumbnail', method: 'post', handler: generateThumbnail }],
  admin: {
    group: 'Archive',
    useAsTitle: 'name',
    components: {
      edit: { Upload: '@/components/ArtifactUpload#ArtifactUpload' },
    },
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
    mimeTypes: ['model/gltf-binary'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'thumbnail',
      required: true,
      type: 'upload',
      relationTo: 'site_images',
      admin: {
        hidden: true,
      },
    },
  ],
}
