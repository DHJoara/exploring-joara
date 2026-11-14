import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

const revalidatePublicContent: CollectionAfterChangeHook &
  CollectionAfterDeleteHook &
  GlobalAfterChangeHook = ({ doc, req }) => {
  // Standalone Payload scripts/tests have no running Next.js cache to invalidate.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    revalidateTag('public-content', { expire: 0 })
  }
  return doc
}

export { revalidatePublicContent }
