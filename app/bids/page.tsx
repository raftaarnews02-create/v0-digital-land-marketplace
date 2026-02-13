'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function BidsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Mock bid data
  const myBids = [
    {
      id: '1',
      propertyTitle: 'Fertile Agricultural Land - Punjab',
      location: 'Punjab, India',
      area: '2.5 acres',
      myBid: 550000,
      currentHighest: 550000,
      minimumIncrement: 10000,
      status: 'winning',
      bidDate: '2024-02-10',
      biddingEnds: '2024-02-28',
      totalBids: 12,
      image: '🌾',
    },
    {
      id: '2',
      propertyTitle: 'Commercial Land in Business District',
      location: 'Bangalore, India',
      area: '5000 sqft',
      myBid: 2100000,
      currentHighest: 2150000,
      minimumIncrement: 50000,
      status: 'outbid',
      bidDate: '2024-02-08',
      biddingEnds: '2024-02-25',
      totalBids: 15,
      image: '🏗️',
    },
    {
      id: '3',
      propertyTitle: 'Urban Residential Plot',
      location: 'Mumbai, India',
      area: '1200 sqft',
      myBid: 1500000,
      currentHighest: 1500000,
      minimumIncrement: 25000,
      status: 'winning',
      bidDate: '2024-02-12',
      biddingEnds: '2024-03-05',
      totalBids: 8,
      image: '🏢',
    },
  ]

  const myOffers = [
    {
      id: 'offer_1',
      propertyTitle: 'Orchard Land with Trees',
      location: 'Himachal Pradesh, India',
      myOffer: 900000,
      sellerAsk: 800000,
      status: 'pending',
      createdAt: '2024-02-11',
      message: 'Buyer ready for immediate payment',
      image: '🍎',
    },
    {
      id: 'offer_2',
      propertyTitle: 'Residential Complex Land',
      location: 'Pune, India',
      myOffer: 1750000,
      sellerAsk: 1800000,
      status: 'rejected',
      createdAt: '2024-02-09',
      message: 'Price negotiation - installment plan available',
      image: '🏠',
    },
  ]

  const handleIncreasebid = (bidId: string) => {
    alert(`Redirecting to increase bid for property ${bidId}`)
  }

  const handleWithdrawBid = (bidId: string) => {
    if (confirm('Are you sure you want to withdraw this bid?')) {
      alert(`Bid ${bidId} withdrawn successfully`)
    }
  }

  const handleCounterOffer = (offerId: string) => {
    alert(`Opening counter offer dialog for ${offerId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              LH
            </div>
            <span className="font-bold text-lg hidden sm:block">LandHub</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/properties')}>
              Browse
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Your Bids & Offers</h1>
            <p className="text-muted-foreground mt-2">
              Track your active bids and manage negotiations with sellers
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Total Active Bids</p>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{myBids.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Winning Bids</p>
                    <CheckCircle className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-3xl font-bold text-accent">
                    {myBids.filter((b) => b.status === 'winning').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Pending Offers</p>
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {myOffers.filter((o) => o.status === 'pending').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bids" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bids">
              My Bids ({myBids.length})
            </TabsTrigger>
            <TabsTrigger value="offers">
              My Offers ({myOffers.length})
            </TabsTrigger>
          </TabsList>

          {/* Bids Tab */}
          <TabsContent value="bids" className="space-y-4">
            {myBids.map((bid) => (
              <Card key={bid.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
                    {bid.image}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Property Info */}
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {bid.propertyTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">{bid.location}</p>
                        <p className="text-sm text-muted-foreground">{bid.area}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge
                            variant={bid.status === 'winning' ? 'default' : 'outline'}
                            className={
                              bid.status === 'winning'
                                ? 'bg-accent text-accent-foreground'
                                : ''
                            }
                          >
                            {bid.status === 'winning' ? '✓ Winning' : '⚠ Outbid'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {bid.totalBids} total bids
                          </span>
                        </div>
                      </div>

                      {/* Bid Info */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Your Bid</p>
                          <p className="text-xl font-bold text-primary">
                            ₹{bid.myBid.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Highest</p>
                          <p className="text-lg font-semibold text-foreground">
                            ₹{bid.currentHighest.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Min. Increment: ₹{bid.minimumIncrement.toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-right">
                          Ends: {bid.biddingEnds}
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleIncreasebid(bid.id)}
                          disabled={bid.status === 'winning' ? false : true}
                        >
                          {bid.status === 'winning' ? 'Increase Bid' : 'Outbid'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleWithdrawBid(bid.id)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            {myOffers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
                    {offer.image}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Property Info */}
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {offer.propertyTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">{offer.location}</p>
                        <p className="text-sm text-muted-foreground italic">
                          {offer.message}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge
                            variant={
                              offer.status === 'pending' ? 'default' : 'outline'
                            }
                            className={
                              offer.status === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : offer.status === 'rejected'
                                  ? 'bg-red-600/20 text-red-600'
                                  : 'bg-accent text-accent-foreground'
                            }
                          >
                            {offer.status.charAt(0).toUpperCase() +
                              offer.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Offer Info */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Your Offer</p>
                          <p className="text-xl font-bold text-primary">
                            ₹{offer.myOffer.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Seller Asking</p>
                          <p className="text-lg font-semibold text-foreground">
                            ₹{offer.sellerAsk.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Difference: ₹
                          {(offer.myOffer - offer.sellerAsk).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-right">
                          Created: {offer.createdAt}
                        </div>
                        {offer.status === 'pending' && (
                          <>
                            <Button
                              className="w-full"
                              onClick={() => handleCounterOffer(offer.id)}
                            >
                              Counter Offer
                            </Button>
                            <Button variant="outline" className="w-full">
                              Withdraw
                            </Button>
                          </>
                        )}
                        {offer.status === 'rejected' && (
                          <Button variant="outline" className="w-full">
                            Make New Offer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
