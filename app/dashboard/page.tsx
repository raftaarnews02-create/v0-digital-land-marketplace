'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, MessageCircle, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Mock data for user's activities
  const myBids = [
    {
      id: '1',
      property: 'Agricultural Land - Punjab',
      bid: '₹550,000',
      status: 'Winning',
      bidDate: '2024-02-10',
    },
    {
      id: '2',
      property: 'Commercial Plot - Bangalore',
      bid: '₹2,100,000',
      status: 'Outbid',
      bidDate: '2024-02-08',
    },
  ]

  const savedProperties = [
    {
      id: '1',
      title: 'Prime Agricultural Land',
      location: 'Punjab',
      area: '2.5 acres',
      savedDate: '2024-02-12',
    },
    {
      id: '2',
      title: 'Urban Residential Plot',
      location: 'Mumbai',
      area: '1200 sqft',
      savedDate: '2024-02-10',
    },
  ]

  const myListings =
    user.role === 'seller' || user.role === 'agent'
      ? [
          {
            id: '1',
            title: 'Orchard Land',
            location: 'Himachal Pradesh',
            status: 'Active',
            views: 245,
            bids: 8,
          },
        ]
      : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              LH
            </div>
            <span className="font-bold text-lg">LandHub</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              Browse
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
        <div className="space-y-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground mt-2">
              Manage your bids, saved properties, and listings all in one place
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Bids</p>
                  <p className="text-3xl font-bold text-primary">
                    {myBids.filter((b) => b.status === 'Winning').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Saved Properties</p>
                  <p className="text-3xl font-bold text-secondary">{savedProperties.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge className="w-fit mt-2 bg-accent text-accent-foreground">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="bids" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            {(user.role === 'seller' || user.role === 'agent') && (
              <TabsTrigger value="listings">My Listings</TabsTrigger>
            )}
          </TabsList>

          {/* My Bids Tab */}
          <TabsContent value="bids" className="space-y-4">
            <div className="space-y-4">
              {myBids.length > 0 ? (
                myBids.map((bid) => (
                  <Card key={bid.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{bid.property}</p>
                          <p className="text-sm text-muted-foreground">Bid placed on {bid.bidDate}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-primary">{bid.bid}</p>
                          <Badge
                            variant={bid.status === 'Winning' ? 'default' : 'outline'}
                            className={
                              bid.status === 'Winning'
                                ? 'bg-accent text-accent-foreground'
                                : ''
                            }
                          >
                            {bid.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No bids yet. Start bidding on properties!</p>
                    <Button className="mt-4" onClick={() => router.push('/')}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Saved Properties Tab */}
          <TabsContent value="saved" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProperties.length > 0 ? (
                savedProperties.map((prop) => (
                  <Card key={prop.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{prop.title}</p>
                            <p className="text-sm text-muted-foreground">{prop.location}</p>
                          </div>
                          <Heart className="w-5 h-5 text-accent fill-accent" />
                        </div>
                        <p className="text-sm text-muted-foreground">{prop.area}</p>
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed md:col-span-2">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No saved properties yet</p>
                    <Button className="mt-4" onClick={() => router.push('/')}>
                      Explore Properties
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Listings Tab (Seller/Agent only) */}
          {(user.role === 'seller' || user.role === 'agent') && (
            <TabsContent value="listings" className="space-y-4">
              <Button className="mb-4">Add New Listing</Button>
              <div className="space-y-4">
                {myListings.length > 0 ? (
                  myListings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">{listing.location}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 py-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Views</p>
                              <p className="text-lg font-bold text-primary">{listing.views}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Active Bids</p>
                              <p className="text-lg font-bold text-accent">{listing.bids}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <Badge className="bg-green-600">{listing.status}</Badge>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View Bids
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No active listings</p>
                      <Button className="mt-4">Create New Listing</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
