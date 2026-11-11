import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ArtifactModel } from '@/components/ArtifactModel'
import '../styles.css'

export const dynamic = 'force-dynamic'

export default async function ArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artifactID = Number(id)
  if (!Number.isSafeInteger(artifactID) || artifactID < 1) notFound()
  const payload = await getPayload({ config })
  const artifact = await payload.findByID({
    collection: 'artifacts',
    id: artifactID,
    disableErrors: true,
  })
  const thumbnail = artifact && typeof artifact.thumbnail === 'object' ? artifact.thumbnail : null
  if (!artifact?.url || !thumbnail?.url) notFound()

  return (
    <>
      <Link className="back-link" href="/artifacts">
        Back to Artifacts
      </Link>
      <h1>{artifact.name}</h1>
      <ArtifactModel
        key={artifact.id}
        src={artifact.url}
        poster={thumbnail.url}
        name={artifact.name}
      />
      <p className="artifact-instructions">
        Drag to rotate. Right-drag or Shift-drag to pan; on touchscreens, drag with two fingers.
        Scroll or pinch to zoom.
      </p>
      {artifact.description && <p className="artifact-description">{artifact.description}</p>}
    </>
  )
}
