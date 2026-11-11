'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteNavigation({ navigation }: { navigation: [string, string][] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation">
      {navigation.map(([label, href]) => {
        const active =
          href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link href={href} key={href} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
