'use client'

import { useState } from 'react'
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
  CheckCircle2, Clock, IndianRupee, Ruler, Navigation
} from 'lucide-react'

const PROPERTIES_DATA = {
  '1': {
    id: '1', title: 'Fertile Agricultural Land', description: 'Prime agricultural land with excellent soil quality and irrigation facilities. Located near main road with easy access to market. The land has been used for wheat and rice cultivation for over 20 years. Government canal water supply available. Suitable for farming, dairy, or horticulture.',
    location: { address: 'Village Boparai Kalan', city: 'Ludhiana', state: 'Punjab', pincode: '141001', lat: 30.9, lng: 75.85 },
    area: '2.5', areaUnit: 'acres', price: 500000, type: 'agricultural', highestBid: 550000, bids: 12, verified: true,
    seller: { name: 'Rajesh Kumar', phone: '+91 98765 43210', verified: true },
    documents: [
      { name: 'Khasra Certificate', status: 'verified' },
      { name: 'Jamabandi Record', status: 'verified' },
      { name: 'Land Registry', status: 'pending' },
    ],
    bidHistory: [
      { bidder: 'Ananya S.', amount: 550000, time: '2 hours ago' },
      { bidder: 'Vikram P.', amount: 520000, time: '5 hours ago' },
      { bidder: 'Suresh M.', amount: 500000, time: '1 day ago' },
    ],
    khasraNo: '234/12', khataNo: 'KH-9876', features: ['Canal Irrigation', 'Near Highway', 'Fertile Soil', 'Electricity Available'],
  },
  '2': {
    id: '2', title: 'Urban Residential Plot', description: 'Well-located residential plot in prime Andheri area with clear title. All civic amenities available including water, electricity, and sewage. Located near schools, hospitals, and metro station. Suitable for building a residential complex or villa.',
    location: { address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058', lat: 19.13, lng: 72.83 },
    area: '1200', areaUnit: 'sqft', price: 1200000, type: 'residential', highestBid: 1500000, bids: 8, verified: true,
    seller: { name: 'Priya Sharma', phone: '+91 87654 32109', verified: true },
    documents: [
      { name: '7/12 Extract', status: 'verified' },
      { name: 'Title Deed', status: 'verified' },
      { name: 'NOC Certificate', status: 'verified' },
    ],
    bidHistory: [
      { bidder: 'Rahul K.', amount: 1500000, time: '1 hour ago' },
      { bidder: 'Meera J.', amount: 1400000, time: '3 hours ago' },
      { bidder: 'Amit T.', amount: 1350000, time: '6 hours ago' },
    ],
    khasraNo: 'N/A', khataNo: 'MH-4532', features: ['Near Metro', 'Clear Title', 'Water Supply', 'Road Facing'],
  },
  '3': {
    id: '3', title: 'Commercial Business Plot', description: 'Prime commercial land in the IT hub of Whitefield. Excellent connectivity with airport and metro. Suitable for IT parks, malls, or commercial complexes. High appreciation potential.',
    location: { address: 'Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', lat: 12.97, lng: 77.75 },
    area: '5000', areaUnit: 'sqft', price: 2000000, type: 'commercial', highestBid: 2200000, bids: 15, verified: true,
    seller: { name: 'Nagaraj Rao', phone: '+91 76543 21098', verified: true },
    documents: [
      { name: 'Property Tax Receipt', status: 'verified' },
      { name: 'Encumbrance Certificate', status: 'verified' },
      { name: 'Conversion Order', status: 'pending' },
    ],
    bidHistory: [
      { bidder: 'Tech Ventures', amount: 2200000, time: '30 min ago' },
      { bidder: 'Rohan D.', amount: 2100000, time: '2 hours ago' },
      { bidder: 'Sunita B.', amount: 2050000, time: '4 hours ago' },
    ],
    khasraNo: 'N/A', khataNo: 'KA-7891', features: ['IT Zone', 'Near Airport', 'Main Road', 'Commercial Zone'],
  },
}

// Generate fallback property data for IDs not in the map
function getProperty(id) {
  if (PROPERTIES_DATA[id]) return PROPERTIES_DATA[id]
  return {
    id, title: 'Land Property', description: 'A quality land property available for purchase. Contact seller for more details.',
    location: { address: 'Main Road', city: 'City', state: 'State', pincode: '000000', lat: 20.5, lng: 78.9 },
    area: '1000', areaUnit: 'sqft', price: 1000000, type: 'residential', highestBid: 1100000, bids: 3, verified: true,
    seller: { name: 'Property Owner', phone: '+91 00000 00000', verified: true },
    documents: [{ name: 'Title Deed', status: 'verified' }],
    bidHistory: [{ bidder: 'Bidder', amount: 1100000, time: '1 hour ago' }],
    khasraNo: 'N/A', khataNo: 'N/A', features: ['Available Now'],
  }
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const property = getProperty(params.id)

  const [saved, setSaved] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidding, setBidding] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid')
      router.push('/login')
      return
    }
    const amount = parseInt(bidAmount)
    if (!amount || amount <= property.highestBid) {
      toast.error(`Bid must be higher than current highest bid of ₹${formatPrice(property.highestBid)}`)
      return
    }
    setBidding(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: property.id, bidAmount: amount, message: bidMessage }),
      })
      if (res.ok) {
        toast.success('Bid placed successfully!')
        setShowBidForm(false)
        setBidAmount('')
        setBidMessage('')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to place bid')
      }
    } catch {
      toast.error('Failed to place bid')
    } finally {
      setBidding(false)
    }
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
        <MapPin className="w-16 h-16 text-primary/40" />
        {property.verified && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
            <Shield className="w-3 h-3 mr-1" /> Verified
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-3 right-3 text-xs bg-card/80 backdrop-blur-sm text-foreground">
          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
        </Badge>
      </div>

      {/* Property Info */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">{property.title}</h2>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{property.location.address}, {property.location.city}, {property.location.state}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <Ruler className="w-4 h-4 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground mt-1">{property.area}</p>
                <p className="text-[10px] text-muted-foreground">{property.areaUnit}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <IndianRupee className="w-4 h-4 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground mt-1">{formatPrice(property.price)}</p>
                <p className="text-[10px] text-muted-foreground">Base Price</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5 text-center">
                <TrendingUp className="w-4 h-4 text-accent mx-auto" />
                <p className="text-sm font-bold text-accent mt-1">{formatPrice(property.highestBid)}</p>
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
                {tab === 'details' ? 'Details' : tab === 'bids' ? `Bids (${property.bids})` : 'Documents'}
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Property Details</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Khasra No.', value: property.khasraNo },
                      { label: 'Khata No.', value: property.khataNo },
                      { label: 'Pincode', value: property.location.pincode },
                      { label: 'State', value: property.location.state },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-xs font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                        {feat}
                      </Badge>
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
                        <span className="text-sm font-bold text-primary">{property.seller.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{property.seller.name}</p>
                        {property.seller.verified && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">Verified Seller</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'bids' && (
            <>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Highest Bid</p>
                      <p className="text-xl font-bold text-primary">{`₹${formatPrice(property.highestBid)}`}</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">{property.bids} Total Bids</Badge>
                  </div>
                  <div className="space-y-3">
                    {property.bidHistory.map((bid, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-bold text-foreground">{bid.bidder.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{bid.bidder}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {bid.time}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${i === 0 ? 'text-accent' : 'text-foreground'}`}>
                          {`₹${formatPrice(bid.amount)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'docs' && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Documents</h3>
                <div className="space-y-3">
                  {property.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === 'verified' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                          <FileText className={`w-4 h-4 ${doc.status === 'verified' ? 'text-primary' : 'text-accent'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{doc.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'} className={`text-[10px] ${doc.status === 'verified' ? 'bg-primary text-primary-foreground' : ''}`}>
                        {doc.status === 'verified' ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bid Form Overlay */}
      {showBidForm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end" onClick={() => setShowBidForm(false)}>
          <div className="bg-card w-full rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">Place Your Bid</h3>
            <p className="text-sm text-muted-foreground mb-4">Current highest bid: {`₹${formatPrice(property.highestBid)}`}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Bid Amount (INR)</label>
                <Input
                  type="number"
                  placeholder={`Min ₹${(property.highestBid + 1000).toLocaleString('en-IN')}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Message (Optional)</label>
                <Textarea
                  placeholder="Add a note to the seller..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowBidForm(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handlePlaceBid} disabled={bidding}>
                  {bidding ? 'Placing Bid...' : 'Place Bid'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/messages')}>
            <MessageCircle className="w-4 h-4 mr-2" /> Contact Seller
          </Button>
          <Button className="flex-1" onClick={() => {
            if (!isAuthenticated) { toast.error('Please login to place a bid'); router.push('/login'); return }
            setShowBidForm(true)
          }}>
            <Gavel className="w-4 h-4 mr-2" /> Place Bid
          </Button>
        </div>
      </div>
    </div>
  )
}
