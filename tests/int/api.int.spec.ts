// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { defaultTimelineURL } from '@/globals/Timeline'

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

  it('provides the public timeline and rejects anonymous edits', async () => {
    const timeline = await payload.findGlobal({ slug: 'timeline', overrideAccess: false })
    expect(timeline.embedURL).toBe(defaultTimelineURL)
    await expect(
      payload.updateGlobal({
        slug: 'timeline',
        data: { embedURL: defaultTimelineURL },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('rejects unsafe timeline URLs', async () => {
    await expect(
      payload.updateGlobal({ slug: 'timeline', data: { embedURL: 'javascript:alert(1)' } }),
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
  it('requires staff editing, allows root uploads, and deletes complete folder trees', async () => {
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
      const websiteImage = await payload.create({
        collection: 'pictures',
        data: {},
        file: file(),
        user: editor,
        overrideAccess: false,
      })
      expect(websiteImage.folder).toBeFalsy()
      await payload.delete({ collection: 'pictures', id: websiteImage.id })

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
      const proxy = await (
        await import('wrangler')
      ).getPlatformProxy<CloudflareEnv>({ remoteBindings: false })
      for (const picture of originals) {
        expect(
          await payload.findByID({ collection: 'pictures', id: picture.id, disableErrors: true }),
        ).toBeNull()
        expect(await proxy.env.R2.head(picture._objectKey || picture.filename!)).toBeNull()
      }
      expect((await payload.findByID({ collection: 'pictures', id: copy.id })).id).toBe(copy.id)
      expect(await proxy.env.R2.head(copy._objectKey || copy.filename!)).not.toBeNull()
      await proxy.dispose()
    } finally {
      await payload.delete({
        collection: 'payload-folders',
        where: { id: { in: [root.id, independent.id] } },
      })
      await payload.delete({ collection: 'users', id: editor.id })
    }
  }, 20000)
})

describe('Artifacts', () => {
  it('requires a scan and photo on save, allows public reads, and restricts editing to staff', async () => {
    const token = crypto.randomUUID()
    const editor = await payload.create({
      collection: 'users',
      data: { email: `artifacts-${token}@example.test`, password: crypto.randomUUID() },
    })
    const photoFolder = await payload.create({
      collection: 'payload-folders',
      data: { name: 'Test thumbnails', folderType: ['pictures'], showInGallery: false },
    })
    const thumbnail = await payload.create({
      collection: 'pictures',
      data: { alt: 'Artifact photo', folder: photoFolder.id },
      filePath: 'public/images/artifact.png',
    })
    let artifactID: number | undefined
    try {
      await expect(
        payload.create({
          collection: 'artifacts',
          data: { name: 'Missing scan', thumbnail: thumbnail.id },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        // @ts-expect-error Verify runtime validation also rejects a missing thumbnail.
        payload.create({
          collection: 'artifacts',
          data: { name: 'Missing photo' },
          filePath: 'tests/fixtures/triangle.glb',
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      const artifact = await payload.create({
        collection: 'artifacts',
        data: { name: `Artifact ${token}`, thumbnail: thumbnail.id },
        filePath: 'tests/fixtures/triangle.glb',
        user: editor,
        overrideAccess: false,
      })
      artifactID = artifact.id
      const saved = await payload.findByID({
        collection: 'artifacts',
        id: artifact.id,
        overrideAccess: false,
      })
      expect(saved.url).toBeTruthy()
      expect(saved.name).toBe(artifact.name)
      await expect(
        payload.update({
          collection: 'artifacts',
          id: artifact.id,
          data: { description: 'Unauthorized' },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        payload.delete({ collection: 'artifacts', id: artifact.id, overrideAccess: false }),
      ).rejects.toThrow()
      await expect(
        payload.create({
          collection: 'artifacts',
          data: { name: 'Unauthorized', thumbnail: thumbnail.id },
          filePath: 'tests/fixtures/triangle.glb',
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    } finally {
      if (artifactID) await payload.delete({ collection: 'artifacts', id: artifactID })
      await payload.delete({ collection: 'payload-folders', id: photoFolder.id })
      await payload.delete({ collection: 'users', id: editor.id })
    }
  }, 20000)
})
