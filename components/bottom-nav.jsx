'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/properties', label: 'Search', icon: Search },
  { href: '/sell', label: 'Sell', icon: PlusCircle },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  const hiddenRoutes = ['/login', '/register']
  if (hiddenRoutes.includes(pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          const isSell = item.href === '/sell'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isSell
                  ? 'relative -mt-4'
                  : ''
              } ${
                isActive && !isSell
                  ? 'text-primary'
                  : !isSell
                  ? 'text-muted-foreground'
                  : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isSell ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium text-primary">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
