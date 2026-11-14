'use cache'

import { cacheLife, cacheTag } from 'next/cache'
import { getPayload, type GlobalSlug, type Where } from 'payload'
import config from '@/payload.config'

// Only anonymous, publicly readable data belongs in these shared caches.
type PublicCollection = 'pictures' | 'site_images' | 'virtual_artifacts' | 'payload-folders'

export async function find<T extends PublicCollection>(options: {
  collection: T
  where?: Where
  sort?: string
  pagination?: boolean
  limit?: number
  page?: number
}) {
  cacheLife('hours')
  cacheTag('public-content')
  const payload = await getPayload({ config })
  return payload.find({ ...options, overrideAccess: false })
}

export async function findByID<T extends PublicCollection>(options: {
  collection: T
  id: number
  disableErrors?: boolean
}) {
  cacheLife('hours')
  cacheTag('public-content')
  const payload = await getPayload({ config })
  return payload.findByID({ ...options, overrideAccess: false })
}

export async function findGlobal<T extends GlobalSlug>(options: { slug: T }) {
  cacheLife('hours')
  cacheTag('public-content')
  const payload = await getPayload({ config })
  return payload.findGlobal({ ...options, overrideAccess: false })
}
