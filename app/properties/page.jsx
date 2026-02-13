'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Grid, List as ListIcon } from 'lucide-react'

export default function PropertiesPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [priceRange, setPriceRange] = useState([0, 5000000])

  // Mock property data
  const allProperties = [
    {
      id: '1',
      title: 'Fertile Agricultural Land',
      location: 'Punjab, India',
      area: 2.5,
      areaUnit: 'acres',
      price: 500000,
      type: 'agricultural',
      highestBid: 500000,
      bids: 12,
      verified: true,
      image: '🌾',
    },
    {
      id: '2',
      title: 'Urban Residential Plot',
      location: 'Mumbai, India',
      area: 1200,
      areaUnit: 'sqft',
      price: 1200000,
      type: 'residential',
      highestBid: 1500000,
      bids: 8,
      verified: true,
      image: '🏢',
    },
    {
      id: '3',
      title: 'Commercial Land in Business District',
      location: 'Bangalore, India',
      area: 5000,
      areaUnit: 'sqft',
      price: 2000000,
      type: 'commercial',
      highestBid: 2000000,
      bids: 15,
      verified: true,
      image: '🏗️',
    },
    {
      id: '4',
      title: 'Orchard Land with Trees',
      location: 'Himachal Pradesh, India',
      area: 3,
      areaUnit: 'acres',
      price: 800000,
      type: 'agricultural',
      highestBid: 950000,
      bids: 5,
      verified: true,
      image: '🍎',
    },
    {
      id: '5',
      title: 'Residential Complex Land',
      location: 'Pune, India',
      area: 2000,
      areaUnit: 'sqft',
      price: 1800000,
      type: 'residential',
      highestBid: 1900000,
      bids: 10,
      verified: true,
      image: '🏠',
    },
    {
      id: '6',
      title: 'Industrial Zone Land',
      location: 'Gujarat, India',
      area: 8000,
      areaUnit: 'sqft',
      price: 3500000,
      type: 'commercial',
      highestBid: 3200000,
      bids: 9,
      verified: true,
      image: '🏭',
    },
  ]

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter((prop) => {
      const matchesSearch =
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === 'all' || prop.type === selectedType

      const matchesPrice = prop.price >= priceRange[0] && prop.price <= priceRange[1]

      return matchesSearch && matchesType && matchesPrice
    })
  }, [searchQuery, selectedType, priceRange])

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse Properties</h1>
              <p className="text-muted-foreground mt-2">
                Discover verified land properties across India
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, property name..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Property Type</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Properties' },
                    { value: 'agricultural', label: 'Agricultural' },
                    { value: 'residential', label: 'Residential' },
                    { value: 'commercial', label: 'Commercial' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={selectedType === type.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Price Range</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    Up to ₹{(priceRange[1] / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Results Header with View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProperties.length} of {allProperties.length} properties
            </p>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                    viewMode === 'list' ? 'flex' : 'flex flex-col'
                  }`}
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <div
                    className={`flex items-center justify-center text-5xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform overflow-hidden ${
                      viewMode === 'grid'
                        ? 'aspect-video w-full'
                        : 'w-40 h-32 flex-shrink-0'
                    }`}
                  >
                    {property.image}
                  </div>

                  <div className={`flex-1 ${viewMode === 'list' ? 'p-4' : 'p-4'}`}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {property.title}
                          </h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="w-4 h-4" />
                            {property.location}
                          </div>
                        </div>
                        {property.verified && (
                          <Badge className="bg-accent text-accent-foreground text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm py-2">
                        <span className="text-muted-foreground">
                          {property.area} {property.areaUnit}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-primary font-semibold">
                          ₹{property.highestBid.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground">{property.bids} active bids</span>
                        <Button size="sm" className="h-7">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 text-center pb-12">
                <p className="text-muted-foreground">
                  No properties found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedType('all')
                    setPriceRange([0, 5000000])
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
