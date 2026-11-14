import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as cachedPayload from '@/utilities/cachedPayload'
import { VirtualArtifactModel } from '@/components/VirtualArtifactModel'
import '../styles.css'

export default async function VirtualArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artifactID = Number(id)
  if (!Number.isSafeInteger(artifactID) || artifactID < 1) notFound()
  const artifact = await cachedPayload.findByID({
    collection: 'virtual_artifacts',
    id: artifactID,
    disableErrors: true,
  })
  const thumbnail = artifact && typeof artifact.thumbnail === 'object' ? artifact.thumbnail : null
  if (!artifact?.url || !thumbnail?.url) notFound()

  return (
    <>
      <Link className="back-link" href="/virtual-artifacts">
        Back to Virtual Artifacts
      </Link>
      <h1>{artifact.name}</h1>
      <VirtualArtifactModel
        key={artifact.id}
        src={artifact.url}
        poster={thumbnail.url}
        name={artifact.name}
      />
      <p className="virtual-artifact-instructions">
        Drag to rotate. Right-drag or Shift-drag to pan; on touchscreens, drag with two fingers.
        Scroll or pinch to zoom.
      </p>
      {artifact.description && (
        <p className="virtual-artifact-description">{artifact.description}</p>
      )}
    </>
  )
}
