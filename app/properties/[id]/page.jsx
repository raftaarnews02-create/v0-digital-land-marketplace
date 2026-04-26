'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  ArrowLeft, MapPin, Heart, Share2, Shield, FileText,
  TrendingUp, Gavel, MessageCircle, Phone, ChevronRight,
  CheckCircle2, Clock, IndianRupee, Ruler, Loader2, AlertCircle
} from 'lucide-react'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated: authContextAuthenticated, user: authUser } = useAuth()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [bids, setBids] = useState([])
  const [highestBid, setHighestBid] = useState(0)
  const [saved, setSaved] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidding, setBidding] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  // Seller: close bidding
  const [closingBidding, setClosingBidding] = useState(false)
  // Seller: buyer details modal
  const [buyerModal, setBuyerModal] = useState(null) // { bid, buyer, loading }
  const [selectingBid, setSelectingBid] = useState(null) // bidId being selected
  // Buyer: increase bid
  const [showIncreaseForm, setShowIncreaseForm] = useState(false)
  const [increaseAmount, setIncreaseAmount] = useState('')
  const [increasing, setIncreasing] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch {}
    }
  }, [])

  const propertySellerId = property?.sellerId
  const userId = user?._id?.toString?.() || user?._id
  const isOwner = propertySellerId && userId && propertySellerId === userId
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const isAuthenticated = !!token
  const canBid = isAuthenticated && user?.role === 'buyer' && !isOwner && property?.status === 'active'

  // My own bid in this property
  const myBid = bids.find((b) => b.buyerId === userId)

  const refreshBids = async () => {
    try {
      const tk = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${params.id}`, {
        headers: tk ? { Authorization: `Bearer ${tk}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        setProperty(data.property)
        setBids(data.bids || [])
        setHighestBid(data.highestBid || data.property?.basePrice || 0)
      }
    } catch {}
  }

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const tk = localStorage.getItem('token')
        const res = await fetch(`/api/properties/${params.id}`, {
          headers: tk ? { Authorization: `Bearer ${tk}` } : {}
        })
        
        if (res.ok) {
          const data = await res.json()
          setProperty(data.property)
          setBids(data.bids || [])
          setHighestBid(data.highestBid || data.property?.basePrice || 0)
        } else {
          toast.error('Property not found')
          router.push('/properties')
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        toast.error('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProperty()
    }
  }, [params.id, router])

  const formatPrice = (price) => {
    if (!price) return '0'
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`
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
    if (diffDays < 30) return `${diffDays}d ago`
    return past.toLocaleDateString()
  }

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid')
      router.push('/login')
      return
    }

    // Check if user is a buyer
    if (user?.role !== 'buyer') {
      toast.error('Only buyers can place bids. Please switch to a buyer account.')
      return
    }

    // Check if user is the owner
    if (isOwner) {
      toast.error('You cannot place a bid on your own property')
      return
    }

    const amount = parseInt(bidAmount)
    if (!amount || amount <= highestBid) {
      toast.error(`Bid must be higher than current highest bid of ₹${formatPrice(highestBid)}`)
      return
    }

    setBidding(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: params.id, bidAmount: amount, message: bidMessage }),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Bid placed successfully!')
        setShowBidForm(false)
        setBidAmount('')
        setBidMessage('')
        // Refresh bids
        const refreshRes = await fetch(`/api/properties/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const refreshData = await refreshRes.json()
        setBids(refreshData.bids || [])
        setHighestBid(refreshData.highestBid || amount)
      } else {
        toast.error(data.message || 'Failed to place bid')
      }
    } catch {
      toast.error('Failed to place bid')
    } finally {
      setBidding(false)
    }
  }

  // Seller: close bidding
  const handleCloseBidding = async () => {
    if (!confirm('Close bidding for this property? No more bids can be placed after this.')) return
    setClosingBidding(true)
    try {
      const tk = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ action: 'close' }),
      })
      if (res.ok) {
        toast.success('Bidding closed successfully')
        await refreshBids()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to close bidding')
      }
    } catch {
      toast.error('Failed to close bidding')
    } finally {
      setClosingBidding(false)
    }
  }

  // Seller: view buyer info for a bid
  const handleViewBuyerInfo = async (bid) => {
    setBuyerModal({ bid, buyer: null, loading: true })
    try {
      const tk = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ action: 'buyer_info', bidId: bid._id }),
      })
      if (res.ok) {
        const data = await res.json()
        setBuyerModal({ bid, buyer: data.buyer, loading: false })
      } else {
        toast.error('Failed to fetch buyer details')
        setBuyerModal(null)
      }
    } catch {
      toast.error('Failed to fetch buyer details')
      setBuyerModal(null)
    }
  }

  // Seller: select winning bid
  const handleSelectWinner = async (bidId) => {
    setSelectingBid(bidId)
    try {
      const tk = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ action: 'select_bid', bidId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Winning bid selected! Buyer & other bidders have been notified.')
        setBuyerModal(prev => prev ? { ...prev, buyer: data.buyer, won: true } : null)
        await refreshBids()
      } else {
        toast.error(data.error || 'Failed to select winner')
      }
    } catch {
      toast.error('Failed to select winner')
    } finally {
      setSelectingBid(null)
    }
  }

  // Buyer: increase bid
  const handleIncreaseBid = async () => {
    if (!myBid) return
    const newAmt = parseInt(increaseAmount)
    if (!newAmt || newAmt <= myBid.amount) {
      toast.error('New amount must be higher than your current bid')
      return
    }
    setIncreasing(true)
    try {
      const tk = localStorage.getItem('token')
      const res = await fetch(`/api/bids/${myBid._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ newAmount: newAmt }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Bid increased to ₹${formatPrice(newAmt)}!`)
        setShowIncreaseForm(false)
        setIncreaseAmount('')
        await refreshBids()
      } else {
        toast.error(data.error || 'Failed to increase bid')
      }
    } catch {
      toast.error('Failed to increase bid')
    } finally {
      setIncreasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Property not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/properties')}>
          Browse Properties
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground truncate flex-1 text-center px-2">Property Details</h1>
          <div className="flex gap-1">
            <button onClick={() => setSaved(!saved)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors" aria-label="Save property">
              <Heart className={`w-5 h-5 ${saved ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors" aria-label="Share property" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!') }}>
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Image / Hero */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {property.images && property.images.length > 0 ? (
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <MapPin className="w-16 h-16 text-primary/40" />
        )}
        {property.status === 'active' && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
            <Shield className="w-3 h-3 mr-1" /> Verified
          </Badge>
        )}
        {property.status === 'pending' && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" /> Pending Verification
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-3 right-3 text-xs bg-card/80 backdrop-blur-sm text-foreground">
          {property.category?.charAt(0).toUpperCase() + property.category?.slice(1) || 'Land'}
        </Badge>
      </div>

      {/* Property Info */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">{property.title}</h2>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">
                {property.location?.address}, {property.location?.city}, {property.location?.state}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <Ruler className="w-4 h-4 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground mt-1">{property.area}</p>
                <p className="text-[10px] text-muted-foreground">{property.areaUnit}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <IndianRupee className="w-4 h-4 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground mt-1">{formatPrice(property.basePrice)}</p>
                <p className="text-[10px] text-muted-foreground">Base Price</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <TrendingUp className="w-4 h-4 text-accent mx-auto" />
                <p className="text-sm font-bold text-accent mt-1">{formatPrice(highestBid)}</p>
                <p className="text-[10px] text-muted-foreground">Highest Bid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="max-w-lg mx-auto">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {['details', 'bids', 'docs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                {tab === 'details' ? 'Details' : tab === 'bids' ? `Bids (${bids.length})` : 'Documents'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 pb-36">
        <div className="max-w-lg mx-auto space-y-4">
          {activeTab === 'details' && (
            <>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description || 'No description provided'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Property Details</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Khasra No.', value: property.khasraNo || 'N/A' },
                      { label: 'Khata No.', value: property.khataNo || 'N/A' },
                      { label: 'Pincode', value: property.location?.pincode || 'N/A' },
                      { label: 'State', value: property.location?.state || 'N/A' },
                      { label: 'Category', value: property.category || 'N/A' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-xs font-medium text-foreground capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Seller Information</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {property.seller?.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{property.seller?.name || 'Seller'}</p>
                        {property.seller?.verified && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">Verified Seller</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {property.seller?.phone && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push('/messages')}
                          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                          aria-label="Message seller"
                        >
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </button>
                        <a
                          href={`tel:${property.seller.phone}`}
                          className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center"
                          aria-label="Call seller"
                        >
                          <Phone className="w-4 h-4 text-accent" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {isOwner && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-primary">This is your listing</p>
                        <p className="text-xs text-muted-foreground">You cannot bid on your own property</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'bids' && (
            <>
              {/* Closed banner */}
              {property?.status === 'closed' && (
                <div className="rounded-2xl bg-muted border border-border p-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Bidding Closed</p>
                    <p className="text-xs text-muted-foreground">The seller has closed this listing. No more bids can be placed.</p>
                  </div>
                </div>
              )}

              {/* Highest Bid Hero Card */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                    {bids.length > 0 ? 'Current Highest Bid' : 'Starting Price'}
                  </p>
                  {bids.length > 0 && (
                    <span className="text-[11px] font-semibold bg-white/20 rounded-full px-2.5 py-0.5">
                      {bids.length} bid{bids.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-extrabold tracking-tight">
                  ₹{formatPrice(highestBid)}
                </p>
                {bids.length > 0 && (
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    Base price: ₹{formatPrice(property?.basePrice)}
                  </p>
                )}

                {/* Seller: close bidding button */}
                {isOwner && property?.status === 'active' && (
                  <button
                    onClick={handleCloseBidding}
                    disabled={closingBidding}
                    className="mt-4 w-full bg-white/20 border border-white/30 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
                  >
                    {closingBidding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Close Bidding
                  </button>
                )}

                {/* Buyer: show their bid or CTA */}
                {canBid && !myBid && (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="mt-4 w-full bg-white text-primary font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
                  >
                    <Gavel className="w-4 h-4" /> Place Your Bid
                  </button>
                )}
                {!isAuthenticated && (
                  <button
                    onClick={() => router.push('/create-account')}
                    className="mt-4 w-full bg-white text-primary font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
                  >
                    <Gavel className="w-4 h-4" /> Sign Up to Bid
                  </button>
                )}
              </div>

              {/* Buyer: My Bid Status Card */}
              {myBid && (
                <div className={`rounded-2xl border-2 p-4 ${
                  myBid.status === 'accepted' ? 'border-primary bg-primary/5' :
                  myBid.status === 'rejected' ? 'border-destructive/30 bg-destructive/5' :
                  myBid._id === bids[0]?._id ? 'border-accent bg-accent/5' :
                  'border-yellow-500/40 bg-yellow-500/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {myBid.status === 'accepted' ? '🎉 Your bid was accepted!' :
                         myBid.status === 'rejected' ? 'Bidding closed — another bid was selected' :
                         myBid._id === bids[0]?._id ? '🏆 You are currently leading!' :
                         '⚡ You have been outbid'}
                      </p>
                      <p className="text-2xl font-extrabold text-foreground">
                        ₹{formatPrice(myBid.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your current bid · placed {formatTimeAgo(myBid.createdAt)}</p>
                    </div>
                    {myBid.status !== 'accepted' && myBid.status !== 'rejected' && property?.status === 'active' && (
                      <button
                        onClick={() => { setIncreaseAmount(''); setShowIncreaseForm(true) }}
                        className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Increase Bid
                      </button>
                    )}
                  </div>
                  {myBid.status !== 'accepted' && myBid.status !== 'rejected' && myBid._id !== bids[0]?._id && (
                    <p className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border/50">
                      Highest bid is ₹{formatPrice(highestBid)} — increase your bid to take the lead.
                    </p>
                  )}
                  {myBid.status === 'accepted' && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      The seller will contact you directly to complete the deal.
                    </p>
                  )}
                </div>
              )}

              {/* Bid Leaderboard */}
              {bids.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <Gavel className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground">No bids yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Be the first to place a bid on this property</p>
                    {canBid && !myBid && (
                      <button
                        onClick={() => setShowBidForm(true)}
                        className="mt-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        <Gavel className="w-4 h-4" /> Place First Bid
                      </button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Bid Leaderboard
                    </p>
                    <div className="space-y-0">
                      {bids.map((bid, i) => {
                        const medals = ['🥇', '🥈', '🥉']
                        const isTop = i === 0
                        const isMyBid = bid.buyerId === userId
                        const isAccepted = bid.status === 'accepted'
                        return (
                          <div
                            key={bid._id || i}
                            className={`flex items-center gap-3 py-3 border-b border-border last:border-0 rounded-xl transition-colors ${
                              isAccepted ? 'bg-primary/5 -mx-2 px-2' :
                              isMyBid ? 'bg-accent/5 -mx-2 px-2' :
                              isTop ? 'bg-muted/50 -mx-2 px-2' : ''
                            }`}
                          >
                            <div className="w-7 text-center flex-shrink-0">
                              {i < 3 ? (
                                <span className="text-lg leading-none">{medals[i]}</span>
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <span className={`text-xs font-bold ${isTop ? 'text-primary' : 'text-foreground'}`}>
                                {bid.buyerName?.charAt(0)?.toUpperCase() || 'B'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`text-sm font-semibold truncate ${isTop ? 'text-primary' : 'text-foreground'}`}>
                                  {isMyBid ? 'You' : (bid.buyerName || 'Anonymous')}
                                </p>
                                {isAccepted && (
                                  <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">Winner</span>
                                )}
                                {bid.status === 'rejected' && (
                                  <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">Rejected</span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {formatTimeAgo(bid.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p className={`text-sm font-extrabold ${isAccepted ? 'text-primary' : isTop ? 'text-primary' : 'text-foreground'}`}>
                                  ₹{formatPrice(bid.amount)}
                                </p>
                                {isTop && !isAccepted && (
                                  <span className="text-[10px] text-primary font-medium">Leading</span>
                                )}
                              </div>
                              {/* Seller action: view buyer + select */}
                              {isOwner && bid.status !== 'accepted' && bid.status !== 'rejected' && (
                                <button
                                  onClick={() => handleViewBuyerInfo(bid)}
                                  className="text-[11px] bg-primary text-primary-foreground font-semibold px-2.5 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" /> Contact
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Seller contact info visible after close */}
              {isOwner && bids.length > 0 && (
                <div className="bg-muted/60 rounded-xl p-3 text-xs text-muted-foreground">
                  Click <strong className="text-foreground">Contact</strong> on any bid to view the buyer's details and select them as the winner.
                </div>
              )}
            </>
          )}

          {activeTab === 'docs' && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Documents</h3>
                {property.documents && property.documents.length > 0 ? (
                  <div className="space-y-3">
                    {property.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === 'verified' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                            <FileText className={`w-4 h-4 ${doc.status === 'verified' ? 'text-primary' : 'text-accent'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{doc.status?.replace('_', ' ') || 'pending'}</p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'} className={`text-[10px] ${doc.status === 'verified' ? 'bg-primary text-primary-foreground' : ''}`}>
                          {doc.status === 'verified' ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bid Form Overlay */}
      {showBidForm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setShowBidForm(false)}
        >
          <div
            className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Place Your Bid</h3>
                  <p className="text-xs text-muted-foreground">
                    Current highest: <span className="font-semibold text-primary">₹{formatPrice(highestBid)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Your Bid Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">₹</span>
                    <Input
                      type="number"
                      placeholder={`Min ${(highestBid + 1000).toLocaleString('en-IN')}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="h-13 pl-8 rounded-xl text-base font-semibold"
                    />
                  </div>
                  {bidAmount && parseInt(bidAmount) > highestBid && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Your bid is {((parseInt(bidAmount) - highestBid) / highestBid * 100).toFixed(1)}% above current highest
                    </p>
                  )}
                  {bidAmount && parseInt(bidAmount) <= highestBid && (
                    <p className="text-xs text-destructive mt-1">Bid must be higher than ₹{formatPrice(highestBid)}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Message to Seller <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Introduce yourself or ask about the property..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowBidForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-12 rounded-xl font-bold text-base"
                    onClick={handlePlaceBid}
                    disabled={bidding || !bidAmount || parseInt(bidAmount) <= highestBid}
                  >
                    {bidding ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing...</>
                    ) : (
                      <><Gavel className="w-4 h-4 mr-2" /> Confirm Bid</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Details Modal (Seller view) */}
      {buyerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setBuyerModal(null)}>
          <div className="bg-card w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {buyerModal.buyer?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{buyerModal.buyer?.name || 'Buyer'}</h3>
                  <p className="text-sm text-primary font-bold">Bid: ₹{formatPrice(buyerModal.bid?.amount)}</p>
                </div>
              </div>

              {buyerModal.loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2 bg-muted rounded-xl p-3 mb-4">
                    {buyerModal.buyer?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Mobile</span>
                        <a href={`tel:${buyerModal.buyer.phone}`} className="text-sm font-semibold text-primary flex items-center gap-1.5 hover:underline">
                          <Phone className="w-3.5 h-3.5" /> +91 {buyerModal.buyer.phone}
                        </a>
                      </div>
                    )}
                    {buyerModal.buyer?.email && !buyerModal.buyer.email.includes('@user.myzameen.in') && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <a href={`mailto:${buyerModal.buyer.email}`} className="text-sm font-semibold text-foreground hover:underline truncate ml-2">
                          {buyerModal.buyer.email}
                        </a>
                      </div>
                    )}
                    {buyerModal.bid?.message && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Note from buyer</p>
                        <p className="text-sm text-foreground italic">"{buyerModal.bid.message}"</p>
                      </div>
                    )}
                  </div>

                  {buyerModal.won ? (
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-primary">🎉 Winner selected! Both parties have been notified.</p>
                    </div>
                  ) : (
                    <div className="flex gap-2.5">
                      {buyerModal.buyer?.phone && (
                        <a
                          href={`tel:${buyerModal.buyer.phone}`}
                          className="flex-1 h-11 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          <Phone className="w-4 h-4 text-primary" /> Call Now
                        </a>
                      )}
                      <button
                        onClick={() => handleSelectWinner(buyerModal.bid._id?.toString())}
                        disabled={selectingBid === buyerModal.bid._id?.toString()}
                        className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                      >
                        {selectingBid ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Select Winner
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Increase Bid Modal (Buyer view) */}
      {showIncreaseForm && myBid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowIncreaseForm(false)}>
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Increase Your Bid</h3>
                  <p className="text-xs text-muted-foreground">
                    Current bid: <span className="font-semibold text-foreground">₹{formatPrice(myBid.amount)}</span>
                    {' · '}Highest: <span className="font-semibold text-primary">₹{formatPrice(highestBid)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">New Bid Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">₹</span>
                    <Input
                      type="number"
                      placeholder={`Min ${(highestBid + 1000).toLocaleString('en-IN')}`}
                      value={increaseAmount}
                      onChange={(e) => setIncreaseAmount(e.target.value)}
                      className="h-12 pl-8 rounded-xl text-base font-semibold"
                      autoFocus
                    />
                  </div>
                  {increaseAmount && parseInt(increaseAmount) > myBid.amount && parseInt(increaseAmount) > highestBid && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> You will take the lead
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowIncreaseForm(false)} className="flex-1 h-12 rounded-xl border border-border font-semibold text-sm text-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleIncreaseBid}
                    disabled={increasing || !increaseAmount || parseInt(increaseAmount) <= myBid.amount}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {increasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingUp className="w-4 h-4" /> Confirm</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto">
          {isOwner ? (
            <div className="flex items-center gap-2 justify-center py-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">This is your listing — {bids.length} bid{bids.length !== 1 ? 's' : ''} received</span>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Button variant="outline" className="h-12 px-4 rounded-xl border-border" onClick={() => router.push('/messages')}>
                <MessageCircle className="w-4 h-4" />
              </Button>

              {property.status === 'closed' ? (
                <Button className="flex-1 h-12 rounded-xl" disabled>
                  <Shield className="w-4 h-4 mr-2" /> Bidding Closed
                </Button>
              ) : property.status === 'pending' ? (
                <Button className="flex-1 h-12 rounded-xl" disabled>
                  <Clock className="w-4 h-4 mr-2" /> Under Review
                </Button>
              ) : !isAuthenticated ? (
                <Button className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={() => router.push('/create-account')}>
                  <Gavel className="w-4 h-4" /> Sign Up to Bid
                </Button>
              ) : myBid && property.status === 'active' ? (
                <Button className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={() => { setIncreaseAmount(''); setShowIncreaseForm(true) }}>
                  <TrendingUp className="w-4 h-4" /> Increase Bid · ₹{formatPrice(myBid.amount)}
                </Button>
              ) : canBid ? (
                <Button className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={() => setShowBidForm(true)}>
                  <Gavel className="w-4 h-4" /> Place Bid — ₹{formatPrice(highestBid)}+
                </Button>
              ) : (
                <Button className="flex-1 h-12 rounded-xl" disabled>
                  <AlertCircle className="w-4 h-4 mr-2" /> Buyers Only
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
