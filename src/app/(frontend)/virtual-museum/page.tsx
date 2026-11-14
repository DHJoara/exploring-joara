import { connection } from 'next/server'
import * as cachedPayload from '@/utilities/cachedPayload'
import { SectionBlurb } from '@/components/SectionBlurb'
import Link from 'next/link'

export default async function VirtualMuseumPage() {
  // The persistent SQLite volume is available at runtime, not during the build.
  await connection()
  const content = await cachedPayload.findGlobal({ slug: 'virtual_museum' })
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
