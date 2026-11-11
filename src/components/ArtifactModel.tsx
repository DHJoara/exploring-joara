'use client'

import { useEffect, useState } from 'react'

export function ArtifactModel({
  src,
  poster,
  name,
}: {
  src: string
  poster: string
  name: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    import('@google/model-viewer').catch(() => setFailed(true))
  }, [])

  return (
    <>
      <model-viewer
        onErrorCapture={() => setFailed(true)}
        className="artifact-model"
        src={src}
        poster={poster}
        alt={name}
        camera-controls
        touch-action="pan-y"
      />
      {failed && <p role="alert">The 3D scan could not be loaded. Please try again later.</p>}
    </>
  )
}
