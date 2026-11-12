import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  revalidateTag: vi.fn(),
  cacheOptions: vi.fn(),
  entries: new Map<string, Promise<unknown>>(),
  findGlobal: vi.fn(),
}))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('next/cache', () => ({
  revalidateTag: mocks.revalidateTag,
  unstable_cache:
    (fn: (query: object) => Promise<unknown>, keys: string[], options: object) =>
    (query: object) => {
      mocks.cacheOptions(options)
      const key = JSON.stringify([keys, query])
      if (!mocks.entries.has(key)) mocks.entries.set(key, fn(query))
      return mocks.entries.get(key)
    },
}))

import { cachedPayload } from '@/utilities/cachedPayload'
import { revalidatePublicContent } from '@/utilities/revalidatePublicContent'

describe('public content cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.entries.clear()
    mocks.find.mockResolvedValue({ docs: [] })
  })

  it('tags public queries and forwards pagination with public access', async () => {
    const payload = cachedPayload
    await payload.find({ collection: 'pictures', page: 1 })
    await payload.find({ collection: 'pictures', page: 2 })
    await payload.find({ collection: 'pictures', page: 1 })
    expect(mocks.cacheOptions).toHaveBeenCalledWith({ tags: ['public-content'], revalidate: 86400 })
    expect(mocks.find).toHaveBeenCalledTimes(2)
    expect(mocks.find).toHaveBeenCalledWith({
      collection: 'pictures',
      page: 1,
      overrideAccess: false,
    })
  })
  it('marks the shared tag stale after content changes', () => {
    revalidatePublicContent()
    expect(mocks.revalidateTag).toHaveBeenCalledWith('public-content', 'max')
    mocks.revalidateTag.mockImplementationOnce(() => {
      throw new Error('No Next context')
    })
    expect(() => revalidatePublicContent()).toThrow('No Next context')
  })
})
