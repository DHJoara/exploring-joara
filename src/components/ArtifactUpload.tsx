'use client'

import { Upload, useConfig, useDocumentInfo, useFormFields, useFormProcessing } from '@payloadcms/ui'

export function ArtifactUpload() {
  const { getEntityConfig } = useConfig()
  const { initialState } = useDocumentInfo()
  const { upload } = getEntityConfig({ collectionSlug: 'artifacts' })
  const processing = useFormProcessing()
  const file = useFormFields(([fields]) => fields.file?.value)

  return (
    <>
      <Upload collectionSlug="artifacts" uploadConfig={upload} initialState={initialState} />
      <div role="status" aria-live="polite">
        {processing ? (
          <>
            <progress aria-label={file ? 'Uploading and saving artifact' : 'Saving artifact'} />
            <p>{file ? 'Uploading and saving… Keep this page open.' : 'Saving…'}</p>
          </>
        ) : file ? (
          <p>File selected—click Save to upload.</p>
        ) : null}
      </div>
    </>
  )
}
