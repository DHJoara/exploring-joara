import type { GlobalConfig } from 'payload'
import { sectionBlurbField } from './sectionBlurb'

export const defaultVirtualArtifactsBlurb =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const VirtualArtifacts: GlobalConfig = {
  slug: 'virtual_artifacts_page',
  label: 'Virtual Artifacts',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [sectionBlurbField(defaultVirtualArtifactsBlurb)],
}
