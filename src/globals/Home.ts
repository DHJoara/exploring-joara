import type { GlobalConfig } from 'payload'

export const defaultHomeIntroduction =
  'Explore the archaeology, environment, and enduring legacy of Joara, an ancient town in present-day western North Carolina, through pictures, artifacts, and stories of the past.'

export const siteSections = [
  {
    title: 'Pictures',
    href: '/pictures',
    key: 'pictures' as const,
    imageSrc: '/images/pictures.png',
    defaultDescription:
      'Explore photographs of the site, the landscape, and the work of archaeology.',
    linkLabel: 'Browse Pictures',
  },
  {
    title: 'Artifacts',
    href: '/artifacts',
    key: 'artifacts' as const,
    imageSrc: '/images/artifact.png',
    defaultDescription: 'View the objects uncovered at Joara and explore them in three dimensions.',
    linkLabel: 'Explore Artifacts',
  },
  {
    title: 'Timeline',
    href: '/timeline',
    key: 'timeline' as const,
    imageSrc: '/images/timeline.png',
    defaultDescription: 'Follow the history of Joara and the surrounding region through time.',
    linkLabel: 'View Timeline',
  },
  {
    title: 'Virtual Museum',
    href: '/virtual-museum',
    key: 'museum' as const,
    imageSrc: '/images/virtual_museum.png',
    defaultDescription: 'A new way to experience the story of Joara. Coming soon.',
    linkLabel: 'Visit the Museum',
  },
]

export const siteName = 'Exploring Joara'
export const siteLocation = 'Burke County, North Carolina'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    ...siteSections.map((section) => ({
      name: section.key,
      label: section.title,
      type: 'group' as const,
      fields: [
        {
          name: 'image',
          type: 'upload' as const,
          relationTo: 'pictures' as const,
          admin: {
            description: 'Choose a card image. Leave empty to use the default image.',
          },
        },
        {
          name: 'description',
          type: 'textarea' as const,
          required: true,
          defaultValue: section.defaultDescription,
        },
      ],
    })),
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'pictures',

      admin: {
        description: 'Choose a landscape image. Leave empty to use the default banner.',
      },
    },
    {
      name: 'bannerAlt',
      label: 'Banner alternative text',
      type: 'text',
      admin: {
        description:
          'Describe the banner for screen readers. Uses the image’s alternative text when left empty.',
      },
    },
    {
      name: 'introduction',
      type: 'textarea',
      defaultValue: defaultHomeIntroduction,
      required: true,
    },
  ],
}
