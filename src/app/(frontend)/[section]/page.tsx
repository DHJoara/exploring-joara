import Link from 'next/link'
import { notFound } from 'next/navigation'

const sections: Record<string, { title: string; description: string }> = {
  artifacts: {
    title: 'Artifacts',
    description:
      'Artifact records and interactive 3D scans will be available here as the collection is added.',
  },
  'virtual-museum': {
    title: 'Virtual Museum',
    description:
      'The virtual museum is coming soon. In the meantime, explore Joara through the archive.',
  },
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const content = sections[section]
  if (!content) notFound()
  return (
    <>
      <h1>{content.title}</h1>
      <p className="section-copy">{content.description}</p>
      <Link className="back-link" href="/">
        Back to Exploring Joara
      </Link>
    </>
  )
}
