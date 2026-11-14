import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

test('refreshes cached public content after a staff edit', async ({ page }) => {
  const payload = await getPayload({ config })
  const token = crypto.randomUUID()
  const credentials = { email: `cache-${token}@example.test`, password: token }
  const user = await payload.create({ collection: 'users', data: credentials })
  const original = await payload.findGlobal({ slug: 'home' })
  let edited = false
  let folderID: number | undefined

  try {
    // Warm the public page before editing through the real Next.js REST handler.
    await page.goto('http://localhost:3000')
    await expect(page.locator('.introduction')).toHaveText(original.introduction!)
    const login = await page.request.post('http://localhost:3000/api/users/login', {
      data: credentials,
    })
    expect(login.ok()).toBe(true)

    const introduction = `Updated cached introduction ${token}`
    const update = await page.request.post('http://localhost:3000/api/globals/home', {
      data: { introduction },
    })
    expect(update.ok()).toBe(true)
    edited = true

    await page.reload()
    await expect(page.locator('.introduction')).toHaveText(introduction)

    // Repeated requests should also see the refreshed entry.
    await page.reload()
    await expect(page.locator('.introduction')).toHaveText(introduction)

    // Folder writes must also invalidate an already-cached listing.
    await page.goto('http://localhost:3000/pictures')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pictures')
    const folderName = `Cached folder ${token}`
    const createFolder = await page.request.post('http://localhost:3000/api/payload-folders', {
      data: { name: folderName, folderType: ['pictures'] },
    })
    expect(createFolder.ok()).toBe(true)
    folderID = (await createFolder.json()).doc.id
    await page.reload()
    await expect(page.getByRole('link', { name: folderName })).toBeVisible()

    const deleteFolder = await page.request.delete(
      `http://localhost:3000/api/payload-folders/${folderID}`,
    )
    expect(deleteFolder.ok()).toBe(true)
    folderID = undefined
    await page.reload()
    await expect(page.getByRole('link', { name: folderName })).toHaveCount(0)
  } finally {
    if (folderID !== undefined) {
      await page.request.delete(`http://localhost:3000/api/payload-folders/${folderID}`)
    }
    if (edited) {
      const restore = await page.request.post('http://localhost:3000/api/globals/home', {
        data: { introduction: original.introduction },
      })
      expect(restore.ok()).toBe(true)
    }
    await payload.delete({ collection: 'users', id: user.id })
  }
})
