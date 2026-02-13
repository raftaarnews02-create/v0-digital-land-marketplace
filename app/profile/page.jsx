'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Shield, LogOut, ChevronRight,
  Settings, HelpCircle, FileText, Bell, Moon, Sun,
  MapPin, Gavel, Heart, Package, Edit3, Camera,
  Lock, CreditCard, Star, Info
} from 'lucide-react'
import { useTheme } from 'next-themes'

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { label: 'My Dashboard', icon: Package, href: '/dashboard', color: 'text-primary' },
      { label: 'My Bids', icon: Gavel, href: '/dashboard', color: 'text-primary' },
      { label: 'Saved Properties', icon: Heart, href: '/dashboard', color: 'text-destructive' },
      { label: 'Messages', icon: Mail, href: '/messages', color: 'text-accent' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Notifications', icon: Bell, href: '/notifications', color: 'text-primary' },
      { label: 'Privacy & Security', icon: Lock, action: 'privacy', color: 'text-foreground' },
      { label: 'Payment Methods', icon: CreditCard, action: 'payment', color: 'text-foreground' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Center', icon: HelpCircle, action: 'help', color: 'text-foreground' },
      { label: 'Terms & Conditions', icon: FileText, action: 'terms', color: 'text-foreground' },
      { label: 'About LandHub', icon: Info, action: 'about', color: 'text-foreground' },
      { label: 'Rate Us', icon: Star, action: 'rate', color: 'text-accent' },
    ],
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', phone: '' })

  useEffect(() => {
    if (user) {
      setEditData({ name: user.fullName || user.name || '', phone: user.phone || '' })
    }
  }, [user])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully')
    setEditing(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background min-h-screen">
        <div className="px-4 pt-8 pb-24">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Welcome to LandHub</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to manage your properties, bids, and messages.
            </p>
            <div className="flex flex-col gap-3 mt-6 max-w-xs mx-auto">
              <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl text-base" onClick={() => router.push('/register')}>
                Create Account
              </Button>
            </div>

            {/* Theme Toggle */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-3 mx-auto px-4 py-3 rounded-xl bg-card border border-border"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-foreground" />}
                <span className="text-sm font-medium text-foreground">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md" aria-label="Change photo">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground truncate">{user.fullName || user.name || 'User'}</h1>
                <Badge className="bg-primary/10 text-primary text-[10px] px-1.5">
                  {user.role || 'buyer'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
              aria-label="Edit profile"
            >
              <Edit3 className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Edit Profile Form */}
          {editing && (
            <Card className="mt-4">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Full Name</label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="mt-1 h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Phone</label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="mt-1 h-10 rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSaveProfile}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-card rounded-xl p-3 text-center border border-border cursor-pointer" onClick={() => router.push('/dashboard')}>
              <p className="text-lg font-bold text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground">Active Bids</p>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border cursor-pointer" onClick={() => router.push('/dashboard')}>
              <p className="text-lg font-bold text-foreground">2</p>
              <p className="text-[10px] text-muted-foreground">Saved</p>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border cursor-pointer" onClick={() => router.push('/messages')}>
              <p className="text-lg font-bold text-foreground">5</p>
              <p className="text-[10px] text-muted-foreground">Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 py-2 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {section.title}
              </p>
              <Card>
                <CardContent className="pt-0 pb-0 px-0 divide-y divide-border">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.href) router.push(item.href)
                          else toast.info(`${item.label} - Coming soon`)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Admin Panel - only for admin users */}
          {user?.role === 'admin' && (
            <Card>
              <CardContent className="pt-0 pb-0 px-0">
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground flex-1">Admin Panel</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          )}

          {/* Theme Toggle */}
          <Card>
            <CardContent className="pt-0 pb-0 px-0">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-foreground" />}
                <span className="text-sm font-medium text-foreground flex-1">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${theme === 'dark' ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
                  <div className="w-5 h-5 rounded-full bg-card shadow-sm" />
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>

          <p className="text-center text-[10px] text-muted-foreground pt-2 pb-4">
            LandHub v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
