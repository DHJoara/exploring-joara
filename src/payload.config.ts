import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Pictures } from './collections/Pictures'
import { VirtualArtifacts } from './collections/VirtualArtifacts'
import { SiteImages } from './collections/SiteImages'
import { pictureFolders } from './collections/PictureFolders'
import { Home } from './globals/Home'
import { Pictures as PicturesPage } from './globals/Pictures'
import { VirtualArtifacts as VirtualArtifactsPage } from './globals/VirtualArtifacts'
import { Timeline } from './globals/Timeline'
import { VirtualMuseum } from './globals/VirtualMuseum'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  auth: { passwordHashIterations: 100000 },
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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  upload: {
    limits: { fileSize: 256 * 1024 * 1024 },
    requestSizeLimit: 260 * 1024 * 1024,
  },
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      alwaysInsertFields: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      clientUploads: true,
      collections: {
        pictures: true,
        site_images: true,
        virtual_artifacts: { signedDownloads: true },
      },
    }),
  ],
})
