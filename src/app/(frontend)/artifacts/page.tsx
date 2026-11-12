import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function ArtifactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = pageParam === undefined ? 1 : Number(pageParam)
  if (!Number.isSafeInteger(page) || page < 1) notFound()

  const payload = await getPayload({ config })
  const artifacts = await payload.find({
    collection: 'artifacts',
    sort: 'name',
    limit: 21,
    page,
  })

  if (page > Math.max(1, artifacts.totalPages)) notFound()

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
                    alt={artifact.name}
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
      {artifacts.totalPages > 1 && (
        <nav className="artifact-pagination" aria-label="Artifact pages">
          {artifacts.hasPrevPage && <Link href={`/artifacts?page=${page - 1}`}>← Previous</Link>}
          <span>Page {page} of {artifacts.totalPages}</span>
          {artifacts.hasNextPage && <Link href={`/artifacts?page=${page + 1}`}>Next →</Link>}
        </nav>
      )}
      {!artifacts.docs.length && <p className="section-copy">No artifacts have been added yet.</p>}
    </>
  )
}
