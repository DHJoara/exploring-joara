import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

const folderName = `Gallery test ${crypto.randomUUID()}`
let folderID: number
let childID: number

// Use temporary records so the test leaves the archive unchanged.
test.beforeAll(async () => {
  const payload = await getPayload({ config })
  const folder = await payload.create({
    collection: 'payload-folders',
    data: { name: folderName, folderType: ['pictures'] },
  })
  folderID = folder.id
  const child = await payload.create({
    collection: 'payload-folders',
    data: { name: 'Nested folder', folder: folderID, folderType: ['pictures'] },
  })
  childID = child.id
  for (const prefix of ['a', 'b']) {
    const { readFile } = await import('node:fs/promises')
    const data = await readFile('public/images/virtual-artifact.png')
    await payload.create({
      collection: 'pictures',
      data: { folder: folderID },
      file: {
        data,
        mimetype: 'image/png',
        name: `${prefix}-${folderName}.png`,
        size: data.length,
      },
    })
  }
})

test.afterAll(async () => {
  if (folderID) {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'payload-folders', id: folderID })
  }
})

test('browses nested folders and views pictures on desktop and mobile', async ({ page }) => {
  await page.goto('http://localhost:3000/pictures')
  await page.getByRole('link', { name: folderName, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`folder=${folderID}$`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(folderName)
  const thumbnails = page.getByRole('button', { name: /^Enlarge/ })
  await expect(thumbnails).toHaveCount(2)
  await thumbnails.first().click()
  const viewer = page.getByRole('dialog', { name: 'Picture viewer' })
  await expect(viewer).toBeVisible()
  await expect(viewer).toContainText('1 / 2')
  await expect(viewer.locator('img')).toBeVisible()
  await viewer.getByRole('button', { name: 'Next' }).click()
  await expect(viewer).toContainText('2 / 2')
  await page.keyboard.press('ArrowLeft')
  await expect(viewer).toContainText('1 / 2')
  await page.keyboard.press('Escape')
  await expect(viewer).not.toBeVisible()
  await expect(thumbnails.first()).toBeFocused()
  await page.getByRole('link', { name: 'Nested folder', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`folder=${childID}$`))
  await expect(page.getByText('No pictures have been added here yet.')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Picture folders' })
    .getByRole('link', { name: folderName })
    .click()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await thumbnails.first().click()
  await expect(viewer).toBeVisible()
  await viewer.getByRole('button', { name: 'Close' }).click()
  await expect(viewer).not.toBeVisible()
  await page.goto('http://localhost:3000/pictures?folder=invalid')
  await expect(page.getByText('This page could not be found.')).toBeVisible()
})
