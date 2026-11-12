import type { GlobalConfig } from 'payload'

export const defaultTimelineURL =
  'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSKiUKTaRGE3UzpI6o-YbxWaWLaxVHug92nsgxVcnjVy6hov6WwdIS55KN6QYh-3Gs3WFJNirWY-lIk&font=Default&lang=en&initial_zoom=2&width=100%25&height=650'

export const Timeline: GlobalConfig = {
  slug: 'timeline',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'embedURL',
      label: 'Iframe URL',
      type: 'text',
      required: true,
      defaultValue: defaultTimelineURL,
      admin: { description: 'Paste the iframe’s src URL, not the full iframe code.' },
      validate: (value: string | null | undefined) => {
        try {
          if (new URL(value ?? '').protocol === 'https:') return true
        } catch {}
        return 'Enter a valid HTTPS URL.'
      },
    },
  ],
}
