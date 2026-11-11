import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PictureGallery } from '@/components/PictureGallery'
import type { FolderInterface } from '@/payload-types'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function PicturesPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const { folder: folderParam } = await searchParams
  const folderID = folderParam === undefined ? null : Number(folderParam)
  if (folderID !== null && (!Number.isSafeInteger(folderID) || folderID < 1)) notFound()
  const payload = await getPayload({ config })
  const findFolder = (id: number | null | undefined) =>
    id == null
      ? null
      : payload.findByID({ collection: 'payload-folders', id, disableErrors: true })
  const folder = await findFolder(folderID)
  if (folderID !== null && !folder) notFound()

  const ancestors: FolderInterface[] = []
  let ancestor = folder
  while (ancestor) {
    ancestors.unshift(ancestor)
    const parentID = typeof ancestor.folder === 'object' ? ancestor.folder?.id : ancestor.folder
    ancestor = await findFolder(parentID)
  }

  const folderFilter = { folder: folderID === null ? { exists: false } : { equals: folderID } }
  const [folders, pictures] = await Promise.all([
    payload.find({
      collection: 'payload-folders',
      where: folderFilter,
      sort: 'name',
      pagination: false,
    }),
    payload.find({
      collection: 'pictures',
      where: folderFilter,
      sort: 'filename',
      pagination: false,
    }),
  ])

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
      {folders.docs.length > 0 && (
        <ul className="picture-folders">
          {folders.docs.map((item) => (
            <li key={item.id}>
              <Link href={`/pictures?folder=${item.id}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M3 7V5h6l2 2h10v12H3z" />
                </svg>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <PictureGallery pictures={galleryPictures} />
      {!folders.docs.length && !pictures.docs.length && (
        <p className="section-copy">No pictures have been added here yet.</p>
      )}
    </>
  )
}
