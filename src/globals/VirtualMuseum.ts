import type { GlobalConfig } from 'payload'
import { sectionBlurbField } from './sectionBlurb'

export const defaultVirtualMuseumBlurb = `Originally created as a physical installation in 2018–2019, this digital exhibit brings the history of Joara and the Berry Site into an interactive online space. When the original digital design files were lost, our team set out to preserve and reimagine the surviving panels and exhibit texts, translating a physical gallery experience into a virtual journey through Western North Carolina’s past.

Guided by foundational storylines established by lead archaeologist Dr. David Moore alongside student-curated visual storytelling, the exhibit unfolds across four thematic arcs: the Indigenous world, Spanish arrival, conflict and resistance, and modern discovery and preservation. Created by Digital Humanities students at NCSSM–Morganton, the virtual museum invites visitors to explore how ongoing archaeological work continues to piece together this buried history.`

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
