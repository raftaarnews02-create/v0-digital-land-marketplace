'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gavel, Heart, ListPlus, Eye, TrendingUp, ArrowRight,
  ChevronRight, Clock, Package, Bell, Loader2
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('bids')
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [bids, setBids] = useState([])
  const [saved, setSaved] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!isAuthenticated && !token) {
      router.replace('/login')
    }

    if (token && !isAuthenticated) {
      const timer = setTimeout(() => window.location.reload(), 1000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])

  // Fetch data when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const fetchData = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      try {
        // Fetch user's bids
        const bidsRes = await fetch('/api/bids', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const bidsData = await bidsRes.json()
        if (bidsData.bids) {
          setBids(bidsData.bids)
        }

        // If user is a seller, fetch their listings
        if (user.role === 'seller' || user.role === 'agent') {
          const listingsRes = await fetch(`/api/properties?sellerId=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const listingsData = await listingsRes.json()
          if (listingsData.data) {
            setListings(listingsData.data)
          }
        }

        // Fetch saved properties (wishlist)
        const savedRes = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const savedData = await savedRes.json()
        if (savedData.data) {
          setSaved(savedData.data)
        }

        // Fetch notifications
        const notifRes = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const notifData = await notifRes.json()
        if (notifData.data) {
          setNotifications(notifData.data.filter(n => !n.read))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const formatTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const isSeller = user.role === 'seller' || user.role === 'agent' || user.role === 'admin'

  const statusColors = {
    winning: 'bg-primary text-primary-foreground',
    outbid: 'bg-destructive/10 text-destructive',
    pending: 'bg-accent/10 text-accent',
    active: 'bg-primary/10 text-primary',
    pending_verification: 'bg-yellow-500/10 text-yellow-600',
    rejected: 'bg-destructive/10 text-destructive',
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'active': return 'Active'
      case 'pending_verification': return 'Under Review'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Welcome Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Hello, {(user.fullName || user.name || 'User').split(' ')[0]}!
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isSeller ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                  {isSeller ? '🏷️ Seller' : '🔍 Buyer'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isSeller ? '— manage your land listings' : '— browse & bid on land'}
                </span>
              </div>
            </div>
          </div>

          {/* Role-based action banner */}
          {isSeller ? (
            <div className="mt-4 bg-gradient-to-r from-accent/20 to-primary/10 rounded-xl p-3.5 flex items-center justify-between border border-accent/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Ready to list land?</p>
                <p className="text-xs text-muted-foreground">Add a new property to start getting bids</p>
              </div>
              <button
                onClick={() => router.push('/sell')}
                className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                + List Now
              </button>
            </div>
          ) : (
            <div className="mt-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3.5 flex items-center justify-between border border-primary/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Explore verified land</p>
                <p className="text-xs text-muted-foreground">Browse new listings and place bids</p>
              </div>
              <button
                onClick={() => router.push('/properties')}
                className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          <Card className="cursor-pointer" onClick={() => setActiveTab('bids')}>
            <CardContent className="pt-3 pb-3 px-3 text-center">
              <Gavel className="w-5 h-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">
                {loading ? '-' : bids.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-[10px] text-muted-foreground">Active Bids</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setActiveTab('saved')}>
            <CardContent className="pt-3 pb-3 px-3 text-center">
              <Heart className="w-5 h-5 text-destructive mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">
                {loading ? '-' : saved.length}
              </p>
              <p className="text-[10px] text-muted-foreground">Saved</p>
            </CardContent>
          </Card>
          {isSeller ? (
            <Card className="cursor-pointer" onClick={() => setActiveTab('listings')}>
              <CardContent className="pt-3 pb-3 px-3 text-center">
                <Package className="w-5 h-5 text-accent mx-auto" />
                <p className="text-lg font-bold text-foreground mt-1">
                  {loading ? '-' : listings.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Listings</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="cursor-pointer" onClick={() => router.push('/notifications')}>
              <CardContent className="pt-3 pb-3 px-3 text-center">
                <Bell className="w-5 h-5 text-accent mx-auto" />
                <p className="text-lg font-bold text-foreground mt-1">
                  {loading ? '-' : notifications.length}
                </p>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Bids Tab */}
              {activeTab === 'bids' && (
                <>
                  {bids.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No bids yet</p>
                        <Button variant="outline" className="mt-3" onClick={() => router.push('/properties')}>
                          Browse Properties <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    bids.map((bid) => (
                      <Card key={bid._id} className="cursor-pointer" onClick={() => router.push(`/properties/${bid.propertyId}`)}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{bid.propertyTitle || 'Property'}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{bid.propertyLocation}</p>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                <Clock className="w-3 h-3" /> {formatTimeAgo(bid.createdAt)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">{`₹${formatPrice(bid.amount)}`}</p>
                              <Badge className={`mt-1 text-[10px] ${statusColors[bid.status] || ''}`}>
                                {bid.status === 'pending' ? 'Pending' : bid.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {bids.length > 0 && (
                    <Button variant="outline" className="w-full" onClick={() => router.push('/properties')}>
                      Browse More Properties <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </>
              )}

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <>
                  {saved.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No saved properties</p>
                        <Button variant="outline" className="mt-3" onClick={() => router.push('/properties')}>
                          Discover Properties <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    saved.map((item) => (
                      <Card key={item._id} className="cursor-pointer" onClick={() => router.push(`/properties/${item.propertyId}`)}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.property?.title || 'Property'}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.property?.location ? `${item.property.location.city}, ${item.property.location.state}` : ''}
                              </p>
                            </div>
                            <Heart className="w-5 h-5 fill-destructive text-destructive flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}

              {/* Listings Tab (Seller) */}
              {activeTab === 'listings' && isSeller && (
                <>
                  <Button className="w-full" onClick={() => router.push('/sell')}>
                    <ListPlus className="w-4 h-4 mr-2" /> Create New Listing
                  </Button>
                  
                  {listings.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No listings yet</p>
                        <p className="text-xs text-muted-foreground mt-1">List your first property to start receiving bids</p>
                        <Button className="mt-3" onClick={() => router.push('/sell')}>
                          List Your Property
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    listings.map((listing) => (
                      <Card key={listing._id}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {listing.location ? `${listing.location.city}, ${listing.location.state}` : ''}
                              </p>
                            </div>
                            <Badge className={`text-[10px] ${statusColors[listing.status] || ''}`}>
                              {getStatusLabel(listing.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" /> {listing.views || 0} views
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Gavel className="w-3 h-3" /> {listing.bids || 0} bids
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={() => router.push(`/properties/${listing._id}`)}>
                              View <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
