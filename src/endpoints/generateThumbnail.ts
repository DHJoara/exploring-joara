import type { PayloadHandler } from 'payload'

// The browser renders the GLB; this endpoint stores its captured thumbnail.
export const generateThumbnail: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ error: 'Sign in first.' }, { status: 401 })
  const form = await req.formData!()
  const file = form.get('file')
  if (!(file instanceof File) || file.type !== 'image/png' || file.size > 2 * 1024 * 1024) {
    return Response.json({ error: 'Expected a PNG up to 2 MiB.' }, { status: 400 })
  }
  const picture = await req.payload.create({
    collection: 'site_images',
    data: {},
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      name: `virtual-artifact-${crypto.randomUUID()}.png`,
      mimetype: 'image/png',
      size: file.size,
    },
    req,
  })
  return Response.json({ id: picture.id })
}
