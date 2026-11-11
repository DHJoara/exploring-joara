import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('allows public homepage reads', async () => {
    const home = await payload.findGlobal({ slug: 'home', overrideAccess: false })
    expect(home).toBeDefined()
  })

  it('rejects anonymous homepage edits', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'home',
        data: { introduction: 'Unauthorized change' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
