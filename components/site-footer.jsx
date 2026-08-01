'use client'

import { usePathname } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

// Configured in .env.local so the same details drive the footer and the widget
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

/** 9145800263 -> 91458 00263 */
const prettyPhone = (n) => (n.length === 10 ? `${n.slice(0, 5)} ${n.slice(5)}` : n)

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

            <div className="mt-4 space-y-2">
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">{CONTACT_EMAIL}</span>
                </a>
              )}
              {WHATSAPP_NUMBER && (
                <a
                  href={`https://wa.me/91${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +91 {prettyPhone(WHATSAPP_NUMBER)}
                </a>
              )}
            </div>
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
