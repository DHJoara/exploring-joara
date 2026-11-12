'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

type GalleryPicture = { id: number; url: string; alt: string; filename: string }

export function PictureGallery({ pictures, folderID, page, totalPictures, viewer }: {
  pictures: GalleryPicture[]
  folderID: number | null
  page: number
  totalPictures: number
  viewer?: string
}) {
  const router = useRouter()
  const folderQuery = folderID === null ? '' : `folder=${folderID}&`
  const [loading, startTransition] = useTransition()
  const [selected, setSelected] = useState<number | null>(
    viewer === 'first' ? 0 : viewer === 'last' ? pictures.length - 1 : null,
  )
  const dialog = useRef<HTMLDialogElement>(null)
  const picture = selected === null ? null : pictures[selected]

  useEffect(() => {
    if (selected !== null && !dialog.current?.open) dialog.current?.showModal()
  }, [selected])

  function navigate(direction: number) {
    if (selected === null || loading) return
    const index = selected + direction
    if (index >= 0 && index < pictures.length) {
      setSelected(index)
      return
    }

    const totalPages = Math.ceil(totalPictures / 21)
    const nextPage = ((page - 1 + direction + totalPages) % totalPages) + 1
    if (nextPage === page) {
      setSelected(direction > 0 ? 0 : pictures.length - 1)
      return
    }
    startTransition(() => {
      router.push(
        `/pictures?${folderQuery}page=${nextPage}&viewer=${direction > 0 ? 'first' : 'last'}`,
        { scroll: false },
      )
    })
  }

  return (
    <>
      <div className="picture-grid">
        {pictures.map((item, index) => (
          <button
            type="button"
            className="picture-thumbnail"
            key={item.id}
            onClick={() => setSelected(index)}
            aria-label={`Enlarge ${item.filename}`}
          >
            <Image
              src={item.url}
              alt={item.alt}
              fill
              sizes="(max-width: 560px) 50vw, (max-width: 900px) 40vw, 25vw"
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="picture-viewer"
        aria-label="Picture viewer"
        onClose={() => {
          setSelected(null)
          if (viewer) router.replace(`/pictures?${folderQuery}page=${page}`, { scroll: false })
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            navigate(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            navigate(1)
          }
        }}
      >
        {picture && (
          <>
            <div className="picture-viewer-bar">
              <p>{picture.filename}</p>
              <a href={picture.url} target="_blank" rel="noreferrer">
                View original
              </a>
              <button type="button" onClick={() => dialog.current?.close()} autoFocus>
                Close
              </button>
            </div>
            <div className="picture-viewer-image">
              <Image key={picture.id} src={picture.url} alt={picture.alt} fill sizes="90vw" />
            </div>
            <p role="status">{loading ? 'Loading pictures…' : ''}</p>
            <div className="picture-viewer-bar">
              <button type="button" onClick={() => navigate(-1)} disabled={loading || totalPictures < 2}>
                Previous
              </button>
              <span>
                {(page - 1) * 21 + selected! + 1} / {totalPictures}
              </span>
              <button type="button" onClick={() => navigate(1)} disabled={loading || totalPictures < 2}>
                Next
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  )
}
