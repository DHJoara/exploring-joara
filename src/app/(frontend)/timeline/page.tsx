import { SectionBlurb } from '@/components/SectionBlurb'
import { cachedPayload } from '@/utilities/cachedPayload'
import './styles.css'

export default async function TimelinePage() {
  const payload = cachedPayload
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
