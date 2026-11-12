import React, { Suspense } from 'react'
import Link from 'next/link'
import { Libre_Caslon_Text, Montserrat } from 'next/font/google'
import { SiteNavigation } from '@/components/SiteNavigation'
import { siteSections, siteName, siteLocation } from '@/globals/Home'
import './styles.css'

const libreCaslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-caslon',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-montserrat',
})

// Search metadata, separate from the introduction displayed on the homepage.
export const metadata = {
  description:
    'Explore the archaeology, pictures, virtual artifacts, and history of Joara in western North Carolina.',
  title: 'Exploring Joara',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navigation: [string, string][] = [
    ['Home', '/'],
    ...siteSections.map((section): [string, string] => [section.title, section.href]),
  ]
  return (
    <html lang="en">
      <body className={`${libreCaslon.variable} ${montserrat.variable}`}>
        <div className="site">
          <div className="site-body">
            <aside className="sidebar">
              <Link className="wordmark" href="/">
                {siteName}
              </Link>
              <SiteNavigation navigation={navigation} />
            </aside>
            <main>
              <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
            </main>
          </div>
          <footer className="site-footer">
            <div className="footer-top">
              <div className="footer-about">
                <Link className="footer-title" href="/">
                  {siteName}
                </Link>
                <p>An archaeological archive of Joara and the upper Catawba Valley.</p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>{siteLocation}</span>
              <p className="footer-credit">
                Made with ❤️ by NCSSM Digital Humanities Class of 2027.
              </p>
              <Link href="/admin">
                Staff login <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
