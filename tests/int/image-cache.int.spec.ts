import { beforeEach, expect, it, vi } from 'vitest'

const fetch = vi.hoisted(() => vi.fn())
vi.mock('../../.open-next/worker.js', () => ({
  default: { fetch },
  DOQueueHandler: class {},
}))
import worker from '../../worker'

beforeEach(() => vi.clearAllMocks())

it('caches optimized images while preserving other response cache policies', async () => {
  for (const [path, status, type, cacheImage, excludeFromEdge] of [
    ['/_next/image?url=test&w=640&q=75', 200, 'image/webp', true, false],
    ['/_next/image?url=test', 404, 'text/plain', false, true],
    ['/_next/image?url=test', 200, 'text/html', false, true],
    ['/admin', 200, 'text/html', false, true],
    ['/api/pictures', 200, 'application/json', false, false],
    ['/pictures', 200, 'text/html', false, true],
    ['/pictures?_rsc=test', 200, 'text/x-component', false, true],
    ['/_next/static/test.js', 200, 'application/javascript', false, false],
    ['/images/banner.png', 200, 'image/png', false, false],
  ] as const) {
    const original = new Response('body', {
      status,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=600',
        Vary: 'Accept',
      },
    })
    fetch.mockResolvedValue(original)
    const response = await worker.fetch(
      new Request(`https://example.com${path}`),
      {} as CloudflareEnv,
      {} as ExecutionContext,
    )
    expect(response.status).toBe(status)
    expect(response.headers.get('Cache-Control')).toBe(
      cacheImage ? 'public, max-age=3600, stale-while-revalidate=86400' : 'public, max-age=600',
    )
    expect(response.headers.get('Cloudflare-CDN-Cache-Control')).toBe(
      excludeFromEdge ? 'no-store' : null,
    )
    if (!cacheImage && !excludeFromEdge) expect(response).toBe(original)
    expect(response.headers.get('Vary')).toBe('Accept')
    expect(await response.text()).toBe('body')
  }
})
