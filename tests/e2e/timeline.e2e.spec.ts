import { test, expect } from '@playwright/test'
import { defaultTimelineURL } from '../../src/globals/Timeline'

test('shows the timeline iframe on desktop and mobile', async ({ page }) => {
  await page.goto('http://localhost:3000/timeline')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Timeline')
  const iframe = page.locator('iframe[title="Joara photo group timeline"]')
  await expect(iframe).toHaveAttribute('src', defaultTimelineURL)
  await expect(iframe).toHaveAttribute('height', '650')
  await expect(iframe).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
