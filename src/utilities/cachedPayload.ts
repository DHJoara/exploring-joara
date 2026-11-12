import { cacheLife, cacheTag } from 'next/cache'
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
    'use cache'
    cacheTag('public-content')
    // Refresh after 24 hours or when a CMS edit marks the tag stale.
    cacheLife({ revalidate: 86400, expire: Infinity })
    const payload = await getPayload({ config })
    return payload.find({ ...options, overrideAccess: false })
  },
  async findByID<T extends CollectionSlug>(options: {
    collection: T
    id: number
    disableErrors?: boolean
  }) {
    'use cache'
    cacheTag('public-content')
    // Refresh after 24 hours or when a CMS edit marks the tag stale.
    cacheLife({ revalidate: 86400, expire: Infinity })
    const payload = await getPayload({ config })
    return payload.findByID({ ...options, overrideAccess: false })
  },
  async findGlobal<T extends GlobalSlug>(options: { slug: T }) {
    'use cache'
    cacheTag('public-content')
    // Refresh after 24 hours or when a CMS edit marks the tag stale.
    cacheLife({ revalidate: 86400, expire: Infinity })
    const payload = await getPayload({ config })
    return payload.findGlobal({ ...options, overrideAccess: false })
  },
}
