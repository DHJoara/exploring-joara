import { SectionBlurb } from '@/components/SectionBlurb'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const payload = await getPayload({ config })
  const timeline = await payload.findGlobal({ slug: 'timeline' })

  return (
    <>
      <h1>Timeline</h1>
      <SectionBlurb text={timeline.blurb} />
      <iframe
        className="timeline-embed"
        src={timeline.embedURL}
        title="Joara photo group timeline"
        width="100%"
        height="650"
        allowFullScreen
      />
    </>
  )
}
