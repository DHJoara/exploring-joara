import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { siteSections, siteName } from '@/globals/Home'

// TODO: Look more into this Read the latest saved homepage content on every request.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const homeContent = await payload.findGlobal({ slug: 'home' })
  const homeCards = siteSections.map((section) => ({
    ...section,
    description: homeContent[section.key]?.description,
  }))
  const banner =
    homeContent.banner && typeof homeContent.banner === 'object' ? homeContent.banner : null

  return (
    <>
      <div className="landscape">
        <Image
          src={banner?.url || '/images/home_page_banner.png'}
          alt={
            homeContent.bannerAlt ||
            (banner?.url
              ? banner.alt || ''
              : 'Reconstructed earthen building and interpretive signs at the Joara site')
          }
          fill
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 75vw, 1000px"
          preload
        />
      </div>
      <h1>{siteName}</h1>
      <p className="introduction">{homeContent.introduction}</p>
      <div className="home-cards">
        {homeCards.map((card) => (
          <a className="home-card" href={card.href} key={card.href}>
            <div className="home-card-image">
              <Image src={card.imageSrc} alt="" fill sizes="(max-width: 900px) 50vw, 25vw" />
            </div>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="home-card-link">
              {card.linkLabel} <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </div>
    </>
  )
}
