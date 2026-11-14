import { SectionBlurb } from '@/components/SectionBlurb'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as cachedPayload from '@/utilities/cachedPayload'
import { PictureGallery } from '@/components/PictureGallery'
import type { FolderInterface } from '@/payload-types'
import './styles.css'

export default async function PicturesPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; page?: string; viewer?: string }>
}) {
  const { folder: folderParam, page: pageParam, viewer } = await searchParams
  const page = pageParam === undefined ? 1 : Number(pageParam)
  if (!Number.isSafeInteger(page) || page < 1) notFound()
  const folderID = folderParam === undefined ? null : Number(folderParam)
  if (folderID !== null && (!Number.isSafeInteger(folderID) || folderID < 1)) notFound()
  const section = await cachedPayload.findGlobal({ slug: 'pictures_page' })
  const findFolder = (id: number | null | undefined) =>
    id == null
      ? null
      : cachedPayload.findByID({ collection: 'payload-folders', id, disableErrors: true })
  const folder = await findFolder(folderID)
  if (folderID !== null && !folder) notFound()

  const ancestors: FolderInterface[] = []
  let ancestor = folder
  while (ancestor) {
    ancestors.unshift(ancestor)
    const parentID = typeof ancestor.folder === 'object' ? ancestor.folder?.id : ancestor.folder
    ancestor = await findFolder(parentID)
  }

  const folderQuery = folderID === null ? '' : `folder=${folderID}&`
  const where = { folder: folderID === null ? { exists: false } : { equals: folderID } }
  const [folders, pictures] = await Promise.all([
    cachedPayload.find({ collection: 'payload-folders', where, sort: 'name', pagination: false }),
    cachedPayload.find({ collection: 'pictures', where, sort: 'filename', limit: 21, page }),
  ])

  if (page > Math.max(1, pictures.totalPages)) notFound()

  const galleryPictures = pictures.docs
    .filter((picture) => Boolean(picture.url))
    .map((picture) => ({
      id: picture.id,
      url: picture.url!,
      alt: picture.alt ?? '',
      filename: picture.filename ?? 'Picture',
    }))

  return (
    <>
      <nav className="picture-breadcrumbs" aria-label="Picture folders">
        <Link href="/pictures" aria-current={folder ? undefined : 'page'}>
          Pictures
        </Link>
        {ancestors.map((item) => (
          <span key={item.id}>
            <span aria-hidden="true"> / </span>
            <Link
              href={`/pictures?folder=${item.id}`}
              aria-current={item.id === folderID ? 'page' : undefined}
            >
              {item.name}
            </Link>
          </span>
        ))}
      </nav>
      <h1>{folder?.name ?? 'Pictures'}</h1>
      {folderID === null && <SectionBlurb text={section.blurb} />}
      {folders.docs.length > 0 && (
        <ul className={`picture-folders${folderID === null ? ' picture-folders-root' : ''}`}>
          {folders.docs.map((item) => (
            <li key={item.id}>
              <Link href={`/pictures?folder=${item.id}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M3 7V5h6l2 2h10v12H3z" />
                </svg>
                <span>{item.name}</span>
                {folderID === null && (
                  <span className="picture-folder-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <PictureGallery
        key={`${folderID}-${page}`}
        pictures={galleryPictures}
        folderID={folderID}
        page={page}
        totalPictures={pictures.totalDocs}
        viewer={viewer}
      />
      {pictures.totalPages > 1 && (
        <nav className="picture-pagination" aria-label="Picture pages">
          {pictures.hasPrevPage && (
            <Link href={`/pictures?${folderQuery}page=${page - 1}`}>← Previous</Link>
          )}
          <span>
            Page {page} of {pictures.totalPages}
          </span>
          {pictures.hasNextPage && (
            <Link href={`/pictures?${folderQuery}page=${page + 1}`}>Next →</Link>
          )}
        </nav>
      )}
      {!folders.docs.length && !pictures.docs.length && (
        <p className="section-copy">No pictures have been added here yet.</p>
      )}
    </>
  )
}
