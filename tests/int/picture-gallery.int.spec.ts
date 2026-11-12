import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { PictureGallery } from '../../src/components/PictureGallery'

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

vi.mock('next/image', () => ({ default: (): null => null }))

it.each([7, null])('changes gallery pages and restores the viewer for folder %s', async (folderID) => {
  const folderQuery = folderID === null ? '' : `folder=${folderID}&`
  const pictures = Array.from({ length: 21 }, (_, index) => ({
    id: index + 1, url: `/photo-${index + 1}.jpg`, alt: '', filename: `Photo ${index + 1}`,
  }))
  const lastPicture = { id: 22, url: '/photo-22.jpg', alt: '', filename: 'Photo 22' }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  const showModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute('open', '') },
  })
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const click = async (element: Element) => {
    await act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  }
  const viewerButton = (text: string) => Array.from(container.querySelectorAll('dialog button'))
    .find(button => button.textContent === text)!

  try {
    await act(async () => {
      root.render(createElement(PictureGallery, { pictures, folderID, page: 1, totalPictures: 22 }))
    })
    await click(container.querySelectorAll('.picture-thumbnail')[20])
    await click(viewerButton('Next'))
    expect(router.push).toHaveBeenLastCalledWith(`/pictures?${folderQuery}page=2&viewer=first`, { scroll: false })

    // Simulate the new server-rendered page arriving after router navigation.
    await act(async () => {
      root.render(createElement(PictureGallery, {
        key: 'page-2', pictures: [lastPicture], folderID, page: 2, totalPictures: 22, viewer: 'first',
      }))
    })
    expect(container.querySelector('dialog')?.hasAttribute('open')).toBe(true)
    expect(container.querySelector('dialog')?.textContent).toContain('22 / 22')
    expect(container.querySelectorAll('.picture-thumbnail')).toHaveLength(1)
    await click(viewerButton('Previous'))
    expect(router.push).toHaveBeenLastCalledWith(`/pictures?${folderQuery}page=1&viewer=last`, { scroll: false })

    await act(async () => {
      root.render(createElement(PictureGallery, {
        key: 'page-1', pictures, folderID, page: 1, totalPictures: 22, viewer: 'last',
      }))
    })
    expect(container.querySelector('dialog')?.textContent).toContain('21 / 22')
    await act(async () => {
      container.querySelector('dialog')!.dispatchEvent(new Event('close'))
    })
    expect(router.replace).toHaveBeenLastCalledWith(`/pictures?${folderQuery}page=1`, { scroll: false })
  } finally {
    await act(async () => root.unmount())
    container.remove()
    vi.clearAllMocks()
    if (showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModal)
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
