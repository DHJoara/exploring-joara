import { revalidateTag } from 'next/cache'

export function revalidatePublicContent() {
  revalidateTag('public-content', 'max')
}
