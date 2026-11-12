import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { VirtualArtifacts } from './collections/VirtualArtifacts'
import { Pictures as PicturesPage } from './globals/Pictures'
import { VirtualArtifacts as VirtualArtifactsPage } from './globals/VirtualArtifacts'
import { VirtualMuseum } from './globals/VirtualMuseum'
import { Home } from './globals/Home'
import { Timeline } from './globals/Timeline'
import { SiteImages } from './collections/SiteImages'
import { Pictures } from './collections/Pictures'
import { pictureFolders } from './collections/PictureFolders'
import { virtualArtifactUploadSample } from './plugins/virtualArtifactUploadSample'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  if (!resolved) return false
  return (
    resolved.endsWith(path.join('payload', 'bin.js')) ||
    resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))
  )
})
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  auth: {
    passwordHashIterations: 100000,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Pictures, VirtualArtifacts, SiteImages],
  folders: pictureFolders,
  globals: [Home, PicturesPage, VirtualArtifactsPage, Timeline, VirtualMuseum],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  upload: {
    limits: {
      fileSize: 256 * 1024 * 1024,
    },
    requestSizeLimit: 260 * 1024 * 1024,
  },
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      clientUploads: {
        access: ({ req }) => Boolean(req.user),
      },
      collections: {
        pictures: true,
        site_images: true,
        virtual_artifacts: true,
      },
    }),
    virtualArtifactUploadSample(cloudflare.env.R2),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
