import { cachedPayload } from '@/utilities/cachedPayload'
import { SectionBlurb } from '@/components/SectionBlurb'
import Link from 'next/link'

export default async function VirtualMuseumPage() {
  const payload = cachedPayload
  const content = await payload.findGlobal({ slug: 'virtual_museum' })
  return (
    <>
      <h1>Virtual Museum</h1>
      <SectionBlurb text={content.blurb} />
      <Link className="back-link" href="/">
        Back to Exploring Joara
      </Link>
    </>
  )
}
