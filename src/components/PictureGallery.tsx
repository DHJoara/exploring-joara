'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type GalleryPicture = { id: number; url: string; alt: string; filename: string }

export function PictureGallery({ pictures }: { pictures: GalleryPicture[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const picture = selected === null ? null : pictures[selected]

  useEffect(() => {
    if (selected !== null && !dialog.current?.open) dialog.current?.showModal()
  }, [selected])

  function navigate(direction: number) {
    setSelected((index) =>
      index === null ? null : (index + direction + pictures.length) % pictures.length,
    )
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
        onClose={() => setSelected(null)}
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
            <div className="picture-viewer-bar">
              <button type="button" onClick={() => navigate(-1)} disabled={pictures.length < 2}>
                Previous
              </button>
              <span>
                {selected! + 1} / {pictures.length}
              </span>
              <button type="button" onClick={() => navigate(1)} disabled={pictures.length < 2}>
                Next
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  )
}
