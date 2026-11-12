import type { GlobalConfig } from 'payload'
import { sectionBlurbField } from './sectionBlurb'

export const defaultVirtualMuseumBlurb =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const VirtualMuseum: GlobalConfig = {
  slug: 'virtual_museum',
  label: 'Virtual Museum',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [sectionBlurbField(defaultVirtualMuseumBlurb)],
}
