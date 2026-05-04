'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import PropertyCard from '@/components/property-card'
import IntentModal from '@/components/intent-modal'
import SellLeadForm from '@/components/sell-lead-form'
import { Search, MapPin, TrendingUp, Shield, FileText, Gavel, ArrowRight, ChevronRight, Loader2 } from 'lucide-react'

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
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [trendingProperties, setTrendingProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIntentModal, setShowIntentModal] = useState(false)
  const [showSellForm, setShowSellForm] = useState(false)

  // Show intent modal on first visit if not authenticated and not yet seen
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('intentModalDone')) {
      const timer = setTimeout(() => setShowIntentModal(true), 600)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties?status=active&limit=10')
        const data = await res.json()
        
        if (data.data && data.data.length > 0) {
          // Featured: first 4 properties
          setFeaturedProperties(data.data.slice(0, 4))
          // Trending: next 4 properties
          setTrendingProperties(data.data.slice(2, 6))
        } else {
          setFeaturedProperties([])
          setTrendingProperties([])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        setFeaturedProperties([])
        setTrendingProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/properties')
    }
  }

  const handleIntentClose = (action) => {
    setShowIntentModal(false)
    if (action === 'sell') {
      setTimeout(() => setShowSellForm(true), 100)
    } else if (action === 'buy') {
      setTimeout(() => router.push('/properties'), 100)
    }
  }

  return (
    <div className="bg-background">
      {showIntentModal && (
        <IntentModal onClose={handleIntentClose} />
      )}
      {showSellForm && (
        <SellLeadForm
          onClose={() => setShowSellForm(false)}
          onSuccess={() => setShowSellForm(false)}
        />
      )}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {featuredProperties.map((property) => (
                <div key={property._id} className="flex-shrink-0 w-[260px]">
                  <PropertyCard property={property} compact />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No properties available yet</p>
              <p className="text-xs mt-1">Check back soon!</p>
            </div>
          )}
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
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                  <div className="h-32 bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trendingProperties.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {trendingProperties.map((property) => (
                <PropertyCard key={property._id} property={property} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No trending properties</p>
            </div>
          )}
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
