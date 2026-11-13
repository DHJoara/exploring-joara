import type { GlobalConfig } from 'payload'
import { sectionBlurbField } from './sectionBlurb'

export const defaultVirtualArtifactsBlurb =
  'For decades, Joara’s artifacts have only been accessible to the public through in-person traveling exhibitions and physical displays. But through 3D rendering, you can examine artifacts from every angle, viewing them through the eyes of a field archaeologist. This collection of 3D-rendered objects provides you with the ability to turn each artifact, examine every scar, and zoom into five centuries of unearthed history. Alongside these models, facts are displayed: the location found, our understanding of the purpose of the tools, and who might have used them in everyday life.'

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
