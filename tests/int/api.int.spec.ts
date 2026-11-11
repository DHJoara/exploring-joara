// @vitest-environment node
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

describe('Pictures and native folders', () => {
  it('requires staff editing and folder membership, and deletes complete folder trees', async () => {
    const token = crypto.randomUUID()
    const editor = await payload.create({
      collection: 'users',
      data: { email: `pictures-${token}@example.test`, password: crypto.randomUUID() },
    })
    const root = await payload.create({
      collection: 'payload-folders',
      data: { name: `Pictures test ${token}`, folderType: ['pictures'] },
    })
    const independent = await payload.create({
      collection: 'payload-folders',
      data: { name: `Independent test ${token}`, folderType: ['pictures'] },
    })
    const { readFile } = await import('node:fs/promises')
    const image = await readFile('public/images/artifact.png')
    const file = () => ({
      data: image,
      mimetype: 'image/png',
      name: `picture-${token}.png`,
      size: image.length,
    })
    try {
      await expect(
        payload.create({
          collection: 'payload-folders',
          data: { name: 'Unauthorized' },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        payload.create({ collection: 'pictures', data: {}, file: file(), overrideAccess: false }),
      ).rejects.toThrow()
      await expect(
        payload.create({
          collection: 'pictures',
          data: {},
          file: file(),
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toMatchObject({ data: { errors: [{ path: 'folder' }] } })

      const child = await payload.create({
        collection: 'payload-folders',
        data: { name: 'Child', folder: root.id, folderType: ['pictures'] },
        user: editor,
        overrideAccess: false,
      })
      const grandchild = await payload.create({
        collection: 'payload-folders',
        data: { name: 'Grandchild', folder: child.id, folderType: ['pictures'] },
        user: editor,
        overrideAccess: false,
      })
      const originals = []
      for (const folder of [root, child, grandchild]) {
        originals.push(
          await payload.create({
            collection: 'pictures',
            data: { folder: folder.id },
            file: file(),
            user: editor,
            overrideAccess: false,
          }),
        )
      }
      const copy = await payload.create({
        collection: 'pictures',
        data: { folder: independent.id },
        file: file(),
        user: editor,
        overrideAccess: false,
      })
      await payload.update({
        collection: 'payload-folders',
        id: root.id,
        data: { name: 'Renamed folder' },
        user: editor,
        overrideAccess: false,
      })
      expect(
        (
          await payload.findByID({
            collection: 'payload-folders',
            id: root.id,
            overrideAccess: false,
          })
        ).name,
      ).toBe('Renamed folder')
      expect(
        (
          await payload.findByID({
            collection: 'pictures',
            id: originals[0].id,
            overrideAccess: false,
          })
        ).folder,
      ).toBeDefined()
      await expect(
        payload.update({
          collection: 'pictures',
          id: copy.id,
          data: { alt: 'Unauthorized' },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        payload.delete({ collection: 'payload-folders', id: root.id, overrideAccess: false }),
      ).rejects.toThrow()
      await expect(
        payload.delete({ collection: 'pictures', id: copy.id, overrideAccess: false }),
      ).rejects.toThrow()

      await payload.delete({
        collection: 'payload-folders',
        id: root.id,
        user: editor,
        overrideAccess: false,
      })
      for (const folder of [root, child, grandchild]) {
        expect(
          await payload.findByID({
            collection: 'payload-folders',
            id: folder.id,
            disableErrors: true,
          }),
        ).toBeNull()
      }
      for (const picture of originals) {
        expect(
          await payload.findByID({ collection: 'pictures', id: picture.id, disableErrors: true }),
        ).toBeNull()
        const { access } = await import('node:fs/promises')
        await expect(access(`pictures/${picture.filename}`)).rejects.toThrow()
      }
      expect((await payload.findByID({ collection: 'pictures', id: copy.id })).id).toBe(copy.id)
      const { access } = await import('node:fs/promises')
      await expect(access(`pictures/${copy.filename}`)).resolves.toBeUndefined()
    } finally {
      await payload.delete({
        collection: 'payload-folders',
        where: { id: { in: [root.id, independent.id] } },
      })
      await payload.delete({ collection: 'users', id: editor.id })
    }
  }, 20000)
})
