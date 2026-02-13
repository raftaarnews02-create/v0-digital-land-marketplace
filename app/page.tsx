'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, TrendingUp } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Sample properties for demonstration
  const properties = [
    {
      id: '1',
      title: 'Fertile Agricultural Land',
      location: 'Punjab, India',
      area: '2.5 acres',
      price: 'Bidding',
      image: '🌾',
      type: 'Agricultural',
      highestBid: '₹500,000',
      bids: 12,
    },
    {
      id: '2',
      title: 'Urban Residential Plot',
      location: 'Mumbai, India',
      area: '1200 sqft',
      price: '₹1,200,000',
      image: '🏢',
      type: 'Residential',
      highestBid: '₹1,500,000',
      bids: 8,
    },
    {
      id: '3',
      title: 'Commercial Land',
      location: 'Bangalore, India',
      area: '5000 sqft',
      price: 'Bidding',
      image: '🏗️',
      type: 'Commercial',
      highestBid: '₹2,000,000',
      bids: 15,
    },
    {
      id: '4',
      title: 'Orchard Land',
      location: 'Himachal Pradesh, India',
      area: '3 acres',
      price: '₹800,000',
      image: '🍎',
      type: 'Agricultural',
      highestBid: '₹950,000',
      bids: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              LH
            </div>
            <span className="font-bold text-lg text-foreground">LandHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/properties" className="text-sm font-medium text-foreground hover:text-primary transition">
              Browse Lands
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
              How It Works
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
              My Listings
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Sell Land
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.clear()
                router.push('/login')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Find Your Perfect Land
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent bidding, verified documents, and secure transactions for agricultural, residential, and commercial land.
            </p>

            <div className="flex items-center justify-center gap-4 pt-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Properties
              </Button>
              <Button size="lg" variant="outline">
                Start Selling
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground">
              Top-rated verified lands available for bidding and purchase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform overflow-hidden">
                  {property.image}
                </div>

                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      {property.type}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">📐</span>
                      {property.area}
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Highest Bid</span>
                      <span className="font-bold text-primary">{property.highestBid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{property.bids} bids</span>
                      <TrendingUp className="w-4 h-4 text-accent" />
                    </div>
                  </div>

                  <Button className="w-full mt-2" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,450+', label: 'Properties Listed' },
              { value: '₹50 Cr', label: 'Total Value Traded' },
              { value: '15K+', label: 'Active Users' },
              { value: '98%', label: 'Verified Listings' },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
