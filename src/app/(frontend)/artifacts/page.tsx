import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function ArtifactsPage() {
  const payload = await getPayload({ config })
  const artifacts = await payload.find({
    collection: 'artifacts',
    sort: 'name',
    pagination: false,
  })

  return (
    <>
      <h1>Artifacts</h1>
      <div className="artifact-grid">
        {artifacts.docs.map((artifact) => {
          const thumbnail = typeof artifact.thumbnail === 'object' ? artifact.thumbnail : null
          return (
            <Link className="artifact-card" href={`/artifacts/${artifact.id}`} key={artifact.id}>
              {thumbnail?.url && (
                <div className="artifact-thumbnail">
                  <Image
                    src={thumbnail.url}
                    alt={thumbnail.alt}
                    fill
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                </div>
              )}
              <h2>{artifact.name}</h2>
            </Link>
          )
        })}
      </div>
      {!artifacts.docs.length && <p className="section-copy">No artifacts have been added yet.</p>}
    </>
  )
}
