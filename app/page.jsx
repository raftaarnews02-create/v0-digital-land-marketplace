'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import PropertyCard from '@/components/property-card'
import { Search, MapPin, TrendingUp, Shield, FileText, Gavel, ArrowRight, ChevronRight } from 'lucide-react'

const FEATURED_PROPERTIES = [
  { id: '1', title: 'Fertile Agricultural Land', location: 'Ludhiana, Punjab', area: '2.5', areaUnit: 'acres', price: 500000, type: 'agricultural', highestBid: 550000, bids: 12, verified: true, image: null },
  { id: '2', title: 'Urban Residential Plot', location: 'Andheri, Mumbai', area: '1200', areaUnit: 'sqft', price: 1200000, type: 'residential', highestBid: 1500000, bids: 8, verified: true, image: null },
  { id: '3', title: 'Commercial Business Plot', location: 'Whitefield, Bangalore', area: '5000', areaUnit: 'sqft', price: 2000000, type: 'commercial', highestBid: 2200000, bids: 15, verified: true, image: null },
  { id: '4', title: 'Apple Orchard Land', location: 'Shimla, Himachal Pradesh', area: '3', areaUnit: 'acres', price: 800000, type: 'agricultural', highestBid: 950000, bids: 5, verified: true, image: null },
  { id: '5', title: 'Farmhouse Plot', location: 'Lonavala, Pune', area: '2000', areaUnit: 'sqft', price: 1800000, type: 'residential', highestBid: 1900000, bids: 10, verified: true, image: null },
  { id: '6', title: 'Industrial Zone Land', location: 'Ahmedabad, Gujarat', area: '8000', areaUnit: 'sqft', price: 3500000, type: 'industrial', highestBid: 3200000, bids: 9, verified: true, image: null },
]

const CATEGORIES = [
  { label: 'Agricultural', value: 'agricultural', icon: '🌾', count: 1240 },
  { label: 'Residential', value: 'residential', icon: '🏠', count: 890 },
  { label: 'Commercial', value: 'commercial', icon: '🏢', count: 456 },
  { label: 'Industrial', value: 'industrial', icon: '🏭', count: 234 },
]

const STATS = [
  { value: '2,450+', label: 'Properties Listed' },
  { value: '₹50 Cr+', label: 'Value Traded' },
  { value: '15K+', label: 'Active Users' },
  { value: '98%', label: 'Verified' },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/properties')
    }
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="px-4 pt-6 pb-8 bg-gradient-to-b from-primary/8 to-background">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground text-balance leading-tight">
            Find Your Perfect Land Across India
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Verified properties, transparent bidding, secure transactions.
          </p>

          <form onSubmit={handleSearch} className="mt-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by city, state, or property..."
              className="pl-10 h-12 rounded-xl bg-card text-foreground border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 py-4">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-3 text-center border border-border">
              <p className="text-sm font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Browse by Category</h2>
            <button onClick={() => router.push('/properties')} className="text-xs text-primary font-medium flex items-center gap-0.5">
              See All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => router.push(`/properties?category=${cat.value}`)}
                className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-medium text-foreground">{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Featured Properties</h2>
            <button onClick={() => router.push('/properties')} className="text-xs text-primary font-medium flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {FEATURED_PROPERTIES.slice(0, 4).map((property) => (
              <div key={property.id} className="flex-shrink-0 w-[260px]">
                <PropertyCard property={property} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending / Hot Deals */}
      <section className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h2 className="font-semibold text-foreground">Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FEATURED_PROPERTIES.slice(2, 6).map((property) => (
              <PropertyCard key={property.id} property={property} compact />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h2 className="font-semibold text-foreground mb-4">How It Works</h2>
          <div className="space-y-3">
            {[
              { icon: Search, title: 'Discover', desc: 'Browse verified land properties across India' },
              { icon: FileText, title: 'Verify', desc: 'Check Khasra, Jamabandi, and registry documents' },
              { icon: Gavel, title: 'Bid', desc: 'Place transparent bids and negotiate directly' },
              { icon: Shield, title: 'Transact', desc: 'Complete secure, verified transactions' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-primary rounded-2xl p-5">
            <h3 className="text-lg font-bold text-primary-foreground">Ready to Sell Your Land?</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">
              List your property and reach thousands of verified buyers.
            </p>
            <Button
              onClick={() => router.push(isAuthenticated ? '/sell' : '/register')}
              className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              size="sm"
            >
              Start Selling <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
