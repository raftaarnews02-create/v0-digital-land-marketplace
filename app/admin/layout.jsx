'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, PhoneCall, Package, Users, Shield, Lock,
  LogOut, Menu, X, Moon, Sun, ExternalLink, Loader2,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: PhoneCall },
  { href: '/admin/contact-requests', label: 'Contact requests', icon: Lock },
  { href: '/admin/properties', label: 'Properties', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
]

// These render without the console chrome and without the auth guard
const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/register']

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPublicRoute = PUBLIC_ADMIN_ROUTES.includes(pathname)

  useEffect(() => {
    if (isPublicRoute) {
      setChecking(false)
      return
    }

    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    let parsed = null
    try { parsed = raw ? JSON.parse(raw) : null } catch {}

    if (!token || parsed?.role !== 'admin') {
      router.replace('/admin/login')
      return
    }

    setAdmin(parsed)
    setChecking(false)
  }, [pathname, isPublicRoute, router])

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (isPublicRoute) return children

  if (checking || !admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
  }

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  const sidebarBody = (
    <>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold leading-tight">
            <span className="text-foreground">Land</span><span className="text-[#16a34a]">Bid</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-[18px] h-[18px]" /> View site
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {theme === 'dark'
            ? <><Sun className="w-[18px] h-[18px]" /> Light mode</>
            : <><Moon className="w-[18px] h-[18px]" /> Dark mode</>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex-col z-40">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarBody}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <p className="font-semibold text-foreground">
            {NAV.find((n) => isActive(n.href))?.label || 'Admin'}
          </p>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{admin.fullName || admin.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{admin.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {(admin.fullName || admin.name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
