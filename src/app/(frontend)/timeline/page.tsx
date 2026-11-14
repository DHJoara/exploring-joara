import { connection } from 'next/server'
import { SectionBlurb } from '@/components/SectionBlurb'
import * as cachedPayload from '@/utilities/cachedPayload'
import './styles.css'

export default async function TimelinePage() {
  // The persistent SQLite volume is available at runtime, not during the build.
  await connection()
  const timeline = await cachedPayload.findGlobal({ slug: 'timeline' })

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
