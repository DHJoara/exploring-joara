import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import type { ModelViewerElement } from '@google/model-viewer'
import config from '../../src/payload.config'

const artifactName = `VirtualArtifact test ${crypto.randomUUID()}`
let artifactID: number
let thumbnailID: number

test.beforeAll(async () => {
  const payload = await getPayload({ config })
  const thumbnail = await payload.create({
    collection: 'site_images',
    data: { alt: 'Virtual artifact photo' },
    filePath: 'public/images/virtual-artifact.png',
  })
  thumbnailID = thumbnail.id
  const artifact = await payload.create({
    collection: 'virtual_artifacts',
    data: {
      name: artifactName,
      description: 'A test artifact with a photograph and interactive scan.',
      thumbnail: thumbnail.id,
    },
    filePath: 'tests/fixtures/triangle.glb',
  })
  artifactID = artifact.id
})

test.afterAll(async () => {
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'virtual_artifacts',
    where: { id: { equals: artifactID } },
  })
  if (thumbnailID) await payload.delete({ collection: 'site_images', id: thumbnailID })
})

test('loads a GLB and supports rotation and zoom on desktop and mobile', async ({ page }) => {
  await page.goto('http://localhost:3000/virtual-artifacts')
  await expect(page.getByRole('link', { name: artifactName })).toBeVisible()
  await page.getByRole('link', { name: artifactName }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(artifactName)
  const viewer = page.locator('model-viewer')
  await expect(viewer).toHaveAttribute('camera-controls', '')
  await expect(viewer).toHaveJSProperty('loaded', true, { timeout: 30000 })
  await expect(
    page.getByText('The 3D scan could not be loaded. Please try again later.'),
  ).toHaveCount(0)
  const initial = await viewer.evaluate((element) =>
    (element as ModelViewerElement).getCameraOrbit(),
  )
  const box = await viewer.boundingBox()
  if (!box) throw new Error('Viewer has no visible bounds')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 10 })
  await page.mouse.up()
  await expect
    .poll(() =>
      viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit().theta),
    )
    .not.toBe(initial.theta)
  await page.mouse.wheel(0, -150)
  await expect
    .poll(() =>
      viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit().radius),
    )
    .not.toBe(initial.radius)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(viewer).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await viewer.evaluate((element) => element.dispatchEvent(new Event('error')))
  await expect(
    page.getByText('The 3D scan could not be loaded. Please try again later.'),
  ).toBeVisible()
})
