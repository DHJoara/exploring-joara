export function SectionBlurb({ text }: { text: string }) {
  return (
    <div className="section-blurb">
      {text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
        <p className="section-copy" key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
