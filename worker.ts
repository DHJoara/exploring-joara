// @ts-ignore OpenNext generates this module after Next.js finishes type checking.
import handler from './.open-next/worker.js'

// @ts-ignore OpenNext generates this module after Next.js finishes type checking.
export { DOQueueHandler } from './.open-next/worker.js'

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    const response = await handler.fetch(request, env, ctx)
    const type = response.headers.get('Content-Type') ?? ''
    const isImage = new URL(request.url).pathname === '/_next/image'

    if (isImage && response.status === 200 && type.startsWith('image/')) {
      const result = new Response(response.body, response)
      result.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
      return result
    }

    // Don't put another cache in front of Next.js pages; CMS tags wouldn't clear it.
    if (isImage || type.includes('text/html') || type.includes('text/x-component')) {
      const result = new Response(response.body, response)
      result.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
      return result
    }
    return response
  },
} satisfies ExportedHandler<CloudflareEnv>
