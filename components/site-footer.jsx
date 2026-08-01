'use client'

import { usePathname } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import Link from 'next/link'

const FOOTER_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Land', href: '/properties' },
      { label: 'Agricultural', href: '/properties?category=agricultural' },
      { label: 'Residential', href: '/properties?category=residential' },
      { label: 'Commercial', href: '/properties?category=commercial' },
    ],
  },
  {
    title: 'For Sellers',
    links: [
      { label: 'List Your Land', href: '/sell' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Messages', href: '/messages' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/create-account' },
      { label: 'My Profile', href: '/profile' },
    ],
  },
]

export default function SiteFooter() {
  const pathname = usePathname()

  const hiddenRoutes = ['/login', '/register', '/create-account']
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/admin')) return null

  return (
    <footer className="hidden md:block border-t border-border bg-card mt-12">
      <div className="app-shell-wide px-6 py-10">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <BrandLogo className="h-16" />
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Verified land listings, transparent bidding and secure transactions across India.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold text-foreground">{section.title}</p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LandBid. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </div>
    </footer>
  )
}
