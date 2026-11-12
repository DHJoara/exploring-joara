import { SectionBlurb } from '@/components/SectionBlurb'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function VirtualArtifactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = pageParam === undefined ? 1 : Number(pageParam)
  if (!Number.isSafeInteger(page) || page < 1) notFound()

  const payload = await getPayload({ config })
  const section = await payload.findGlobal({ slug: 'virtual_artifacts_page' })
  const artifacts = await payload.find({
    collection: 'virtual_artifacts',
    sort: 'name',
    limit: 21,
    page,
  })

  if (page > Math.max(1, artifacts.totalPages)) notFound()

  return (
    <>
      <h1>Virtual Artifacts</h1>
      <SectionBlurb text={section.blurb} />
      <div className="virtual-artifact-grid">
        {artifacts.docs.map((artifact) => {
          const thumbnail = typeof artifact.thumbnail === 'object' ? artifact.thumbnail : null
          return (
            <Link className="virtual-artifact-card" href={`/virtual-artifacts/${artifact.id}`} key={artifact.id}>
              {thumbnail?.url && (
                <div className="virtual-artifact-thumbnail">
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
        <nav className="virtual-artifact-pagination" aria-label="Virtual artifact pages">
          {artifacts.hasPrevPage && <Link href={`/virtual-artifacts?page=${page - 1}`}>← Previous</Link>}
          <span>Page {page} of {artifacts.totalPages}</span>
          {artifacts.hasNextPage && <Link href={`/virtual-artifacts?page=${page + 1}`}>Next →</Link>}
        </nav>
      )}
      {!artifacts.docs.length && <p className="section-copy">No virtual artifacts have been added yet.</p>}
    </>
  )
}
