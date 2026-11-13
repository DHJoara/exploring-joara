import { getPayload } from 'payload'
import config from '@/payload.config'
import { SectionBlurb } from '@/components/SectionBlurb'
import Link from 'next/link'

export default async function VirtualMuseumPage() {
  const payload = await getPayload({ config })
  const content = await payload.findGlobal({ overrideAccess: false, slug: 'virtual_museum' })
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
