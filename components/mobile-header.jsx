'use client'

import { useRouter, usePathname } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import { useAuth } from '@/lib/auth-context'
import { Bell, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function MobileHeader() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  // Auth screens and the admin console carry their own chrome
  const hiddenRoutes = ['/login', '/register', '/create-account']
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/admin')) return null

  return (
    <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" aria-label="LandBid home">
          <BrandLogo className="h-9" priority />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/messages"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Messages"
          >
            <MessageCircle className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Link>
          <Link
            href="/notifications"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Link>
        </div>
      </div>
    </header>
  )
}
