import { test, expect } from '@playwright/test'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

// Exercise the actual WebGL capture and save, rather than mocking a thumbnail.
test('creates a thumbnail from a model without asking for a photo', async ({ page }) => {
  test.setTimeout(120000)
  await seedTestUser()
  let artifactID: number | undefined
  let thumbnailID: number | undefined
  try {
    const login = await page.request.post('http://localhost:3000/api/users/login', {
      data: testUser,
    })
    expect(login.ok()).toBe(true)
    await page.goto('http://localhost:3000/admin/collections/virtual_artifacts/create')
    const name = `Generated thumbnail ${crypto.randomUUID()}`
    await page.locator('#field-name').fill(name)
    await page.locator('input[type="file"]').first().setInputFiles('tests/fixtures/triangle.glb')
    await expect(page.getByText('Thumbnail ready. Click Save to upload the model.')).toBeVisible({
      timeout: 90000,
    })
    await expect(page.locator('#field-thumbnail')).toBeHidden()
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page).toHaveURL(/\/virtual_artifacts\/\d+$/, { timeout: 60000 })
    artifactID = Number(new URL(page.url()).pathname.split('/').pop())
    const response = await page.request.get(
      `http://localhost:3000/api/virtual_artifacts/${artifactID}`,
    )
    const artifact = await response.json()
    thumbnailID = artifact.thumbnail.id
    expect(artifact.thumbnail.mimeType).toBe('image/png')
    expect(artifact.thumbnail.width).toBeGreaterThan(0)
    const image = await page.request.get(
      new URL(artifact.thumbnail.url, 'http://localhost:3000').href,
    )
    expect(image.ok()).toBe(true)
    expect((await image.body()).length).toBeGreaterThan(100)
    await page.goto('http://localhost:3000/pictures')
    await expect(
      page.getByRole('link', { name: 'Virtual artifact thumbnails', exact: true }),
    ).toHaveCount(0)
  } finally {
    if (artifactID)
      await page.request.delete(`http://localhost:3000/api/virtual_artifacts/${artifactID}`)
    if (thumbnailID)
      await page.request.delete(`http://localhost:3000/api/site_images/${thumbnailID}`)
    await cleanupTestUser()
  }
})
