'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Gavel, MessageCircle, Shield, TrendingUp, CheckCheck, Clock } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: '1', type: 'bid', title: 'New Bid on Your Property',
    message: 'Someone placed a bid of ₹5.5L on Fertile Agricultural Land',
    time: '5 min ago', read: false,
  },
  {
    id: '2', type: 'outbid', title: 'You Have Been Outbid',
    message: 'Your bid of ₹21L on Commercial Plot has been exceeded by ₹22L',
    time: '30 min ago', read: false,
  },
  {
    id: '3', type: 'offer', title: 'Offer Accepted!',
    message: 'Ananya Singh accepted your offer of ₹9L for Orchard Land',
    time: '2 hours ago', read: false,
  },
  {
    id: '4', type: 'document', title: 'Document Verified',
    message: 'Your Khasra Certificate has been successfully verified',
    time: '5 hours ago', read: true,
  },
  {
    id: '5', type: 'system', title: 'Welcome to LandHub',
    message: 'Complete your profile to get verified badge and attract more buyers',
    time: '1 day ago', read: true,
  },
  {
    id: '6', type: 'bid', title: 'Bid Expired',
    message: 'Your bid on Premium Villa Plot has expired. Place a new bid to stay active.',
    time: '2 days ago', read: true,
  },
]

const iconMap = {
  bid: Gavel,
  outbid: TrendingUp,
  offer: CheckCheck,
  document: Shield,
  system: Bell,
  message: MessageCircle,
}

const colorMap = {
  bid: 'bg-primary/10 text-primary',
  outbid: 'bg-destructive/10 text-destructive',
  offer: 'bg-accent/10 text-accent',
  document: 'bg-primary/10 text-primary',
  system: 'bg-muted text-muted-foreground',
  message: 'bg-accent/10 text-accent',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-primary">
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 pb-24">
        <div className="max-w-lg mx-auto space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell
            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${!notif.read ? 'border-primary/20 bg-primary/[0.02]' : ''}`}
                onClick={() => markRead(notif.id)}
              >
                <CardContent className="pt-3 pb-3 px-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[notif.type] || 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" /> {notif.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">We will notify you when something happens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
