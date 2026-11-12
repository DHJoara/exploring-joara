import { unstable_cache } from 'next/cache'
import { getPayload, type CollectionSlug, type GlobalSlug, type Where } from 'payload'
import config from '@/payload.config'

export const cachedPayload = {
  async find<T extends CollectionSlug>(options: {
    collection: T
    where?: Where
    sort?: string
    pagination?: boolean
    limit?: number
    page?: number
  }) {
    return unstable_cache(
      async (query: typeof options) => {
        const payload = await getPayload({ config })
        return payload.find({ ...query, overrideAccess: false })
      },
      ['public-content', 'find'],
      // Refresh after 24 hours or when a CMS edit marks the tag stale.
      { tags: ['public-content'], revalidate: 86400 },
    )(options)
  },
  async findByID<T extends CollectionSlug>(options: {
    collection: T
    id: number
    disableErrors?: boolean
  }) {
    return unstable_cache(
      async (query: typeof options) => {
        const payload = await getPayload({ config })
        return payload.findByID({ ...query, overrideAccess: false })
      },
      ['public-content', 'findByID'],
      // Refresh after 24 hours or when a CMS edit marks the tag stale.
      { tags: ['public-content'], revalidate: 86400 },
    )(options)
  },
  async findGlobal<T extends GlobalSlug>(options: { slug: T }) {
    return unstable_cache(
      async (query: typeof options) => {
        const payload = await getPayload({ config })
        return payload.findGlobal({ ...query, overrideAccess: false })
      },
      ['public-content', 'findGlobal'],
      // Refresh after 24 hours or when a CMS edit marks the tag stale.
      { tags: ['public-content'], revalidate: 86400 },
    )(options)
  },
}
