import { getPayload } from 'payload'
import config from '@/payload.config'
import { SectionBlurb } from '@/components/SectionBlurb'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (section !== 'virtual-museum') notFound()
  const payload = await getPayload({ config })
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
