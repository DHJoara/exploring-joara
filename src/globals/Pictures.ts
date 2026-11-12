import type { GlobalConfig } from 'payload'
import { sectionBlurbField } from './sectionBlurb'

export const defaultPicturesBlurb = `The Joara Photo Archive showcases photos, posters, and outreach events since 1985. Our collection features photos from our Field Days, Artifacts, Informational panels, and even photos from our Berry site. Explore our hand-picked selection of photos that opens a new world.

To begin traversing, click on a folder to begin exploring each of our events. Each folder contains organized photographs in chronological order. You can examine digital artifacts, inspect what tools they used in the berry site digging, and even investigate how the digital archive was made.`

export const Pictures: GlobalConfig = {
  slug: 'pictures_page',
  label: 'Pictures',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [sectionBlurbField(defaultPicturesBlurb)],
}
