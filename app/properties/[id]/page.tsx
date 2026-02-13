'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Share2, MapPin, DollarSign, Calendar, Users } from 'lucide-react'
import { useState } from 'react'

interface PropertyDetailsPageProps {
  params: { id: string }
}

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [bidAmount, setBidAmount] = useState('')

  // Mock property data
  const property = {
    id: params.id,
    title: 'Fertile Agricultural Land with Good Irrigation Facility',
    location: 'Punjab, India',
    area: 2.5,
    areaUnit: 'acres',
    price: 500000,
    type: 'agricultural',
    verified: true,
    description:
      'Premium agricultural land located in the heart of Punjab with excellent irrigation facilities. Suitable for wheat, rice, and cotton farming. Well-maintained soil quality and access to modern farming equipment.',
    highlights: [
      'Irrigation facility available',
      'Good soil quality',
      'Near main road',
      'Close to market',
      'Electricity connection available',
    ],
    owner: {
      name: 'Rajesh Kumar',
      type: 'Individual Farmer',
      verified: true,
    },
    image: '🌾',
    biddingDetails: {
      startPrice: 400000,
      currentBid: 500000,
      highestBidder: 'Anonymous Bidder',
      totalBids: 12,
      biddingEnds: '2024-02-28',
      minimumIncrement: 10000,
    },
    documents: [
      { name: 'Khasra Certificate', verified: true },
      { name: 'Land Ownership Deed', verified: true },
      { name: 'Tax Payment Receipt', verified: true },
      { name: 'Water Rights Certificate', verified: true },
    ],
    images: [
      { id: 1, thumbnail: '📷' },
      { id: 2, thumbnail: '📷' },
      { id: 3, thumbnail: '📷' },
    ],
    bidHistory: [
      { bidder: 'Ananya Singh', amount: 500000, time: '2 hours ago' },
      { bidder: 'Vikram Patel', amount: 480000, time: '4 hours ago' },
      { bidder: 'Priya Sharma', amount: 460000, time: '1 day ago' },
    ],
  }

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    // Bid placement logic here
    alert(`Bid of ₹${bidAmount} placed successfully!`)
    setBidAmount('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-sm"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-accent text-accent' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-9xl">
                {property.image}
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {property.images.map((img) => (
                  <div
                    key={img.id}
                    className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-muted/80 transition"
                  >
                    {img.thumbnail}
                  </div>
                ))}
              </div>
            </Card>

            {/* Property Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-foreground">
                        {property.title}
                      </h1>
                      {property.verified && (
                        <Badge className="bg-accent text-accent-foreground">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-lg">
                      <MapPin className="w-5 h-5" />
                      {property.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="text-lg font-bold text-foreground">
                    {property.area} {property.areaUnit}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-lg font-bold text-foreground capitalize">
                    {property.type}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Bids</p>
                  <p className="text-lg font-bold text-accent">
                    {property.biddingDetails.totalBids}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">About This Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Highlights</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {property.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="bidHistory">Bid History</TabsTrigger>
                <TabsTrigger value="owner">Owner Info</TabsTrigger>
              </TabsList>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-3">
                  {property.documents.map((doc, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-medium text-foreground">{doc.name}</p>
                            {doc.verified && (
                              <p className="text-xs text-green-600">✓ Verified</p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Bid History Tab */}
              <TabsContent value="bidHistory" className="space-y-3">
                {property.bidHistory.map((bid, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{bid.bidder}</p>
                          <p className="text-sm text-muted-foreground">{bid.time}</p>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          ₹{bid.amount.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Owner Info Tab */}
              <TabsContent value="owner">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
                        {property.owner.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {property.owner.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {property.owner.type}
                          {property.owner.verified && ' • Verified'}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Contact Owner
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Bidding */}
          <div className="lg:col-span-1 space-y-4">
            {/* Bidding Card */}
            <Card className="sticky top-20 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Current Highest Bid
                </CardTitle>
                <div className="pt-2">
                  <p className="text-4xl font-bold text-primary">
                    ₹{property.biddingDetails.currentBid.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {property.biddingDetails.highestBidder}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Bid Details */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Starting Price</span>
                    <span className="font-medium">
                      ₹{property.biddingDetails.startPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min. Increment</span>
                    <span className="font-medium">
                      ₹{property.biddingDetails.minimumIncrement.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bidding Ends</span>
                    <span className="font-medium">{property.biddingDetails.biddingEnds}</span>
                  </div>
                </div>

                {/* Bid Input */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Your Bid Amount
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-muted-foreground">₹</span>
                      <input
                        type="number"
                        placeholder="Enter your bid"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        min={
                          property.biddingDetails.currentBid +
                          property.biddingDetails.minimumIncrement
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum: ₹
                      {(
                        property.biddingDetails.currentBid +
                        property.biddingDetails.minimumIncrement
                      ).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handlePlaceBid}
                    disabled={!bidAmount}
                  >
                    {isAuthenticated ? 'Place Bid' : 'Sign in to Bid'}
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full" variant="outline">
                    Contact Seller
                  </Button>
                  <Button className="w-full" variant="outline">
                    Report Listing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground mb-3">Share This Property</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    📘
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    𝕏
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    📧
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    🔗
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
