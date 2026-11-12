'use client'

import {
  Upload,
  useConfig,
  useDocumentInfo,
  useField,
  useFormFields,
  useFormProcessing,
} from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export function VirtualArtifactUpload() {
  const { getEntityConfig } = useConfig()
  const { initialState } = useDocumentInfo()
  const { upload } = getEntityConfig({ collectionSlug: 'virtual_artifacts' })

  const processing = useFormProcessing()
  const file = useFormFields(([fields]) => fields.file?.value) as File | undefined
  const { setValue: setThumbnailId } = useField({ path: 'thumbnail' })

  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!(file instanceof File)) return

    const controller = new AbortController()
    const src = URL.createObjectURL(file)
    let viewer: import('@google/model-viewer').ModelViewerElement | undefined

    setThumbnailId(null)

    async function capture() {
      await import('@google/model-viewer')
      if (controller.signal.aborted) return

      setStatus('Creating thumbnail… Please wait before saving.')

      viewer = document.createElement('model-viewer')
      viewer.style.cssText = 'position:fixed;left:-2000px;width:512px;height:512px;background:#eee;'
      viewer.setAttribute('loading', 'eager')
      viewer.setAttribute('camera-orbit', '30deg 70deg auto')

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Model loading timed out.')), 60000)

        const finish = (error?: Error) => {
          clearTimeout(timer)

          if (error) reject(error)
          else resolve()
        }

        viewer!.addEventListener('load', () => finish(), { once: true })
        viewer!.addEventListener('error', () => finish(new Error('Could not load model.')), {
          once: true,
        })
        controller.signal.addEventListener('abort', () => finish(new Error('Cancelled')), {
          once: true,
        })

        viewer!.src = src
        document.body.appendChild(viewer!)
      })

      const blob = await viewer.toBlob({ idealAspect: true })

      const form = new FormData()
      form.append('file', blob, 'thumbnail.png')

      const response = await fetch('/api/virtual_artifacts/thumbnail', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      })

      if (!response.ok) throw new Error('Could not save thumbnail.')

      const { id } = (await response.json()) as { id: number }

      if (!controller.signal.aborted) {
        setThumbnailId(id)
        setStatus('Thumbnail ready. Click Save to upload the model.')
      }
    }

    capture()
      .catch(() => {
        if (!controller.signal.aborted)
          setStatus('Could not create thumbnail. Select the model again to retry.')
      })
      .finally(() => viewer?.remove())

    return () => {
      controller.abort()
      viewer?.remove()
      URL.revokeObjectURL(src)
    }
  }, [file, setThumbnailId])

  return (
    <>
      <Upload collectionSlug="virtual_artifacts" uploadConfig={upload} initialState={initialState} />

      <div role="status" aria-live="polite">
        {processing ? (
          <>
            <progress aria-label="Saving virtual artifact" />
            <p>Uploading and saving… Keep this page open.</p>
          </>
        ) : (
          <p>{status}</p>
        )}
      </div>
    </>
  )
}
