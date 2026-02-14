'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gavel, Heart, ListPlus, Eye, TrendingUp, ArrowRight,
  ChevronRight, Clock, Package, Bell
} from 'lucide-react'

const MOCK_BIDS = [
  { id: '1', property: 'Fertile Agricultural Land', location: 'Ludhiana, Punjab', bid: 550000, status: 'winning', time: '2h ago' },
  { id: '2', property: 'Commercial Business Plot', location: 'Whitefield, Bangalore', bid: 2100000, status: 'outbid', time: '5h ago' },
  { id: '3', property: 'Apple Orchard Land', location: 'Shimla, HP', bid: 900000, status: 'pending', time: '1d ago' },
]

const MOCK_SAVED = [
  { id: '1', title: 'Prime Agricultural Land', location: 'Punjab', area: '2.5 acres' },
  { id: '5', title: 'Farmhouse Plot Near Highway', location: 'Pune', area: '2000 sqft' },
]

const MOCK_LISTINGS = [
  { id: '1', title: 'Orchard Land with Trees', location: 'Shimla, HP', status: 'active', views: 245, bids: 8 },
  { id: '2', title: 'Industrial Zone Land', location: 'Ahmedabad, GJ', status: 'review', views: 12, bids: 0 },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('bids')

  useEffect(() => {
    const token = localStorage.getItem('token')
    // Only redirect if not authenticated AND no token is found in storage
    if (!isAuthenticated && !token) {
      router.replace('/login')
    }

    // Safety fallback: If token exists but auth context is stuck (e.g. after router.push), force reload
    if (token && !isAuthenticated) {
      const timer = setTimeout(() => window.location.reload(), 1000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const isSeller = user.role === 'seller' || user.role === 'agent' || user.role === 'admin'

  const statusColors = {
    winning: 'bg-primary text-primary-foreground',
    outbid: 'bg-destructive/10 text-destructive',
    pending: 'bg-accent/10 text-accent',
    active: 'bg-primary/10 text-primary',
    review: 'bg-accent/10 text-accent',
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Welcome Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground">
            Hello, {user.fullName || user.name || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSeller ? 'Manage your listings and track bids' : 'Track your bids and saved properties'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          <Card className="cursor-pointer" onClick={() => setActiveTab('bids')}>
            <CardContent className="pt-3 pb-3 px-3 text-center">
              <Gavel className="w-5 h-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{MOCK_BIDS.filter(b => b.status === 'winning').length}</p>
              <p className="text-[10px] text-muted-foreground">Active Bids</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setActiveTab('saved')}>
            <CardContent className="pt-3 pb-3 px-3 text-center">
              <Heart className="w-5 h-5 text-destructive mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{MOCK_SAVED.length}</p>
              <p className="text-[10px] text-muted-foreground">Saved</p>
            </CardContent>
          </Card>
          {isSeller ? (
            <Card className="cursor-pointer" onClick={() => setActiveTab('listings')}>
              <CardContent className="pt-3 pb-3 px-3 text-center">
                <Package className="w-5 h-5 text-accent mx-auto" />
                <p className="text-lg font-bold text-foreground mt-1">{MOCK_LISTINGS.length}</p>
                <p className="text-[10px] text-muted-foreground">Listings</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="cursor-pointer" onClick={() => router.push('/notifications')}>
              <CardContent className="pt-3 pb-3 px-3 text-center">
                <Bell className="w-5 h-5 text-accent mx-auto" />
                <p className="text-lg font-bold text-foreground mt-1">4</p>
                <p className="text-[10px] text-muted-foreground">Alerts</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {[
              { key: 'bids', label: 'My Bids' },
              { key: 'saved', label: 'Saved' },
              ...(isSeller ? [{ key: 'listings', label: 'Listings' }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 pb-24">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <>
              {MOCK_BIDS.map((bid) => (
                <Card key={bid.id} className="cursor-pointer" onClick={() => router.push(`/properties/${bid.id}`)}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{bid.property}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{bid.location}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" /> {bid.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{`₹${formatPrice(bid.bid)}`}</p>
                        <Badge className={`mt-1 text-[10px] ${statusColors[bid.status] || ''}`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => router.push('/properties')}>
                Browse More Properties <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <>
              {MOCK_SAVED.map((prop) => (
                <Card key={prop.id} className="cursor-pointer" onClick={() => router.push(`/properties/${prop.id}`)}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{prop.location} - {prop.area}</p>
                      </div>
                      <Heart className="w-5 h-5 fill-destructive text-destructive flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => router.push('/properties')}>
                Discover Properties <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Listings Tab (Seller) */}
          {activeTab === 'listings' && isSeller && (
            <>
              <Button className="w-full" onClick={() => router.push('/sell')}>
                <ListPlus className="w-4 h-4 mr-2" /> Create New Listing
              </Button>
              {MOCK_LISTINGS.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{listing.location}</p>
                      </div>
                      <Badge className={`text-[10px] ${statusColors[listing.status] || ''}`}>
                        {listing.status === 'review' ? 'Under Review' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" /> {listing.views} views
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Gavel className="w-3 h-3" /> {listing.bids} bids
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={() => router.push(`/properties/${listing.id}`)}>
                        View <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
