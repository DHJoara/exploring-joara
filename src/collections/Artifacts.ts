import type { CollectionConfig } from 'payload'

export const Artifacts: CollectionConfig = {
  slug: 'artifacts',
  admin: {
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
      relationTo: 'media',
      filterOptions: { mimeType: { like: 'image/' } },
      admin: {
        description: 'Upload a real-life photo of the artifact.',
      },
    },
  ],
}
