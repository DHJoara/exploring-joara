/**
 * Workaround for Payload's R2 adapter returning an empty validation body for client uploads
 * over 50 MiB. Payload then falls back to text/plain and rejects valid GLB files. Supply
 * the first 64 KiB for its existing MIME detector without loading the full model into memory.
 * Register after r2Storage; ordinary downloads still use the original R2 handler.
 */
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities'
import type { R2StorageOptions } from '@payloadcms/storage-r2'
import { ValidationError, type Plugin } from 'payload'

// Register after r2Storage so its upload handlers are already present.
export const virtualArtifactUploadSample = (bucket: R2StorageOptions['bucket']): Plugin => (config) => {
  const collection = config.collections!.find(({ slug }) => slug === 'virtual_artifacts')!
  if (!collection.upload || typeof collection.upload !== 'object') return config
  // R2 returns an empty body for large client uploads. Supply a sample for Payload's MIME check.
  collection.upload.handlers!.push(async (req, { params: { clientUploadContext, filename } }) => {
    if (!clientUploadContext) return
    const key = await getStorageFilePath({ clientUploadContext, collection, filename, req })
    const object = await bucket.get(key, { range: { offset: 0, length: 64 * 1024 } })
    if (!object || object.size > 256 * 1024 * 1024) {
      throw new ValidationError({
        errors: [{ path: 'file', message: 'Upload a file up to 256 MiB.' }],
      })
    }
    return new Response(object.body, {
      status: 206,
      headers: { 'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream' },
    })
  })
  return config
}
