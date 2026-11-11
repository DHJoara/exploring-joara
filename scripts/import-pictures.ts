// PAYLOAD_URL=https://your-site PAYLOAD_TOKEN=your-jwt pnpm exec tsx scripts/import-pictures.ts /path/to/photos
// Creates a fresh folder tree on every run. Get a JWT from POST /api/users/login.
import { openAsBlob } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const { PAYLOAD_URL, PAYLOAD_TOKEN } = process.env
const directory = process.argv[2]
if (!PAYLOAD_URL || !PAYLOAD_TOKEN || !directory) {
  throw new Error('Set PAYLOAD_URL and PAYLOAD_TOKEN and pass a local pictures directory.')
}

const imageTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
}

async function create(collection: string, body: FormData): Promise<{ id: number }> {
  const response = await fetch(new URL(`/api/${collection}`, PAYLOAD_URL), {
    method: 'POST',
    headers: { Authorization: `JWT ${PAYLOAD_TOKEN}` },
    body,
  })
  if (!response.ok) throw new Error(`${collection}: ${await response.text()}`)
  const result = await response.json() as { doc: { id: number } }
  return result.doc
}

async function importDirectory(directory: string, parent?: number) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      const folderData = new FormData()
      folderData.set('_payload', JSON.stringify({
        name: entry.name, folder: parent, folderType: ['pictures'],
      }))
      const folder = await create('payload-folders', folderData)
      await importDirectory(path, folder.id)
    } else if (entry.isFile() && imageTypes[extname(entry.name).toLowerCase()]) {
      if (parent === undefined) throw new Error(`Put this picture in a subfolder: ${path}`)

      const form = new FormData()
      form.set('_payload', JSON.stringify({ folder: parent }))
      form.set('file', await openAsBlob(path, {
        type: imageTypes[extname(entry.name).toLowerCase()],
      }), entry.name)
      await create('pictures', form)
      console.log(path)
    }
  }
}

await importDirectory(resolve(directory))
