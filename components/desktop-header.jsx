'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'
import BrandLogo from '@/components/brand-logo'
import {
  Search, Bell, MessageCircle, LayoutDashboard, PlusCircle,
  User, LogOut, Moon, Sun, ChevronDown,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/', key: 'navHome' },
  { href: '/properties', key: 'navBuyLand' },
  { href: '/sell', key: 'navSellLand' },
  { href: '/dashboard', key: 'navDashboard', authOnly: true },
]

export default function DesktopHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const hiddenRoutes = ['/login', '/register', '/create-account']
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/admin')) return null

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(searchQuery.trim() ? `/properties?search=${encodeURIComponent(searchQuery)}` : '/properties')
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const links = NAV_LINKS.filter((l) => !l.authOnly || isAuthenticated)

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="app-shell-wide px-4 lg:px-6 h-[72px] flex items-center">

        {/* Brand */}
        <Link href="/" className="flex-shrink-0" aria-label="LandBid home">
          {/* Smaller at the md breakpoint, where nav + search leave little room */}
          <BrandLogo className="h-8 xl:h-10" priority />
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-0.5 lg:gap-1 ml-6 lg:ml-10 xl:ml-14" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {t(link.key)}
              {isActive(link.href) && (
                <span className="absolute left-3 right-3 -bottom-[9px] h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 lg:gap-3">

          {/* Compact search — only from xl, below that the row runs out of room */}
          <form onSubmit={handleSearch} className="hidden xl:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              placeholder="Search city or property"
              className="w-56 xl:w-72 h-10 pl-9 pr-3 rounded-full bg-muted/70 border border-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:border-border transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <span className="hidden xl:block w-px h-6 bg-border" aria-hidden="true" />

          {/* Notifications & messages */}
          <div className="flex items-center gap-0.5">
            <Link
              href="/messages"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-[18px] h-[18px] text-foreground" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
            </Link>
            <Link
              href="/notifications"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px] text-foreground" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              <span className="hidden xl:block w-px h-6 bg-border" aria-hidden="true" />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden" role="menu">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user?.fullName || user?.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.phone || user?.email}</p>
                      </div>
                      {[
                        { label: t('menuDashboard'), icon: LayoutDashboard, href: '/dashboard' },
                        { label: t('menuProfile'), icon: User, href: '/profile' },
                        { label: t('menuList'), icon: PlusCircle, href: '/sell' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { setMenuOpen(false); router.push(item.href) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          role="menuitem"
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" /> {item.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                        role="menuitem"
                      >
                        {theme === 'dark'
                          ? <><Sun className="w-4 h-4 text-accent" /> {t('themeLight')}</>
                          : <><Moon className="w-4 h-4 text-muted-foreground" /> {t('themeDark')}</>}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors text-left border-t border-border"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" /> {t('signOut')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-[18px] h-[18px] text-accent" />
                  : <Moon className="w-[18px] h-[18px] text-foreground" />}
              </button>
              <span className="hidden xl:block w-px h-6 bg-border" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                  className="h-9 rounded-full border border-border bg-muted px-2.5 lg:px-3 text-xs lg:text-sm font-medium text-foreground whitespace-nowrap"
                >
                  {t('langToggleLabel')}
                </button>
                <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={() => router.push('/login')}>
                  {t('signIn')}
                </Button>
                <Button size="sm" className="whitespace-nowrap rounded-full px-4" onClick={() => router.push('/create-account')}>
                  {t('getStarted')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
