'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Eye, DollarSign, Users } from 'lucide-react'

export default function SellerListingsPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
    if (user && user.role !== 'seller' && user.role !== 'agent') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Mock seller data
  const activeListings = [
    {
      id: '1',
      title: 'Orchard Land with Trees',
      location: 'Himachal Pradesh, India',
      area: '3 acres',
      price: '₹800,000',
      views: 456,
      bids: 8,
      highestBid: '₹950,000',
      daysListed: 15,
      status: 'active',
      image: '🍎',
    },
    {
      id: '2',
      title: 'Residential Complex Land',
      location: 'Pune, India',
      area: '2000 sqft',
      price: '₹1,800,000',
      views: 892,
      bids: 10,
      highestBid: '₹1,900,000',
      daysListed: 8,
      status: 'active',
      image: '🏠',
    },
  ]

  const soldListings = [
    {
      id: '3',
      title: 'Agricultural Land',
      location: 'Tamil Nadu, India',
      area: '1.5 acres',
      soldPrice: '₹650,000',
      views: 234,
      bids: 5,
      daysListed: 22,
      soldDate: '2024-01-25',
      status: 'sold',
      image: '🌾',
    },
  ]

  const draftListings = [
    {
      id: '4',
      title: 'Industrial Zone Land',
      location: 'Gujarat, India',
      area: '8000 sqft',
      price: '₹3,500,000',
      status: 'draft',
      image: '🏭',
    },
  ]

  const stats = [
    { label: 'Total Views', value: '1,348', icon: Eye },
    { label: 'Total Bids', value: '18', icon: Users },
    { label: 'Revenue Generated', value: '₹650,000', icon: DollarSign },
    { label: 'Avg. Days to Sell', value: '22', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              LH
            </div>
            <span className="font-bold text-lg hidden sm:block">LandHub</span>
            <Badge className="hidden sm:block ml-4 bg-secondary text-secondary-foreground">
              Seller Dashboard
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              My Account
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout()
                router.push('/login')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your property listings on LandHub
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              Create New Listing
            </Button>
            <Button variant="outline">
              Analytics
            </Button>
          </div>
        </div>

        {/* Listings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeListings.length})
            </TabsTrigger>
            <TabsTrigger value="sold">
              Sold ({soldListings.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({draftListings.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Listings */}
          <TabsContent value="active" className="space-y-4">
            {activeListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
                    {listing.image}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Property Info */}
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                        <p className="text-sm text-muted-foreground">{listing.area}</p>
                        <Badge className="w-fit bg-green-600 text-white">
                          Active
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="text-2xl font-bold text-primary">
                            {listing.views}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bids</p>
                          <p className="text-lg font-semibold text-accent">
                            {listing.bids}
                          </p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Ask Price</p>
                          <p className="text-xl font-bold text-primary">
                            {listing.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Highest Bid</p>
                          <p className="text-lg font-semibold text-foreground">
                            {listing.highestBid}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button size="sm" className="w-full">
                          View Bids
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Promote
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Sold Listings */}
          <TabsContent value="sold" className="space-y-4">
            {soldListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
                    {listing.image}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Property Info */}
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                        <p className="text-sm text-muted-foreground">{listing.area}</p>
                        <Badge className="w-fit bg-green-600 text-white">
                          ✓ Sold
                        </Badge>
                      </div>

                      {/* Sale Info */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Sold Price</p>
                          <p className="text-2xl font-bold text-accent">
                            {listing.soldPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sold On</p>
                          <p className="text-sm font-semibold">
                            {listing.soldDate}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Views</p>
                          <p className="text-lg font-bold">{listing.views}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Bids</p>
                          <p className="text-lg font-bold">{listing.bids}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          List Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Draft Listings */}
          <TabsContent value="draft" className="space-y-4">
            {draftListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl opacity-50">
                    {listing.image}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                        <p className="text-sm text-muted-foreground">{listing.area}</p>
                        <Badge className="w-fit bg-muted text-foreground">
                          Draft
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full">
                          Complete & Publish
                        </Button>
                        <Button variant="outline" className="w-full">
                          Edit
                        </Button>
                        <Button variant="outline" className="w-full">
                          Delete
                        </Button>
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
