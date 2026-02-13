'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        type: 'bid_placed',
        title: 'New Bid on Your Property',
        message: 'Someone placed a bid of ₹550,000 on Fertile Agricultural Land',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 'notif_2',
        type: 'bid_outbid',
        title: 'You Have Been Outbid',
        message: 'Your bid of ₹2,100,000 has been exceeded',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'notif_3',
        type: 'offer_received',
        title: 'New Offer Received',
        message: 'Ananya Singh made an offer of ₹900,000 for Orchard Land',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'notif_4',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Your Khasra Certificate has been verified',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_placed':
        return '🏷️'
      case 'bid_outbid':
        return '⚠️'
      case 'offer_received':
        return '💰'
      case 'document_verified':
        return '✓'
      default:
        return '📢'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-sm">
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Header */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Your Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNotifications(
                    notifications.map((n) => ({ ...n, read: true }))
                  )
                }}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <CardContent className="pt-4 flex items-start justify-between gap-4">
                  {/* Notification Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 text-center pb-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                You&apos;re all caught up! No new notifications.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/')}
              >
                Continue Browsing
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
