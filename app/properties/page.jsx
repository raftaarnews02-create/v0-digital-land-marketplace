'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PropertyCard from '@/components/property-card'
import { Search, SlidersHorizontal, X, Grid, List, ChevronDown } from 'lucide-react'

const ALL_PROPERTIES = [
  { id: '1', title: 'Fertile Agricultural Land', location: 'Ludhiana, Punjab', area: '2.5', areaUnit: 'acres', price: 500000, type: 'agricultural', highestBid: 550000, bids: 12, verified: true, image: null },
  { id: '2', title: 'Urban Residential Plot', location: 'Andheri, Mumbai', area: '1200', areaUnit: 'sqft', price: 1200000, type: 'residential', highestBid: 1500000, bids: 8, verified: true, image: null },
  { id: '3', title: 'Commercial Business Plot', location: 'Whitefield, Bangalore', area: '5000', areaUnit: 'sqft', price: 2000000, type: 'commercial', highestBid: 2200000, bids: 15, verified: true, image: null },
  { id: '4', title: 'Apple Orchard Land', location: 'Shimla, Himachal Pradesh', area: '3', areaUnit: 'acres', price: 800000, type: 'agricultural', highestBid: 950000, bids: 5, verified: true, image: null },
  { id: '5', title: 'Farmhouse Plot Near Highway', location: 'Lonavala, Pune', area: '2000', areaUnit: 'sqft', price: 1800000, type: 'residential', highestBid: 1900000, bids: 10, verified: true, image: null },
  { id: '6', title: 'Industrial Zone Land', location: 'Ahmedabad, Gujarat', area: '8000', areaUnit: 'sqft', price: 3500000, type: 'industrial', highestBid: 3200000, bids: 9, verified: true, image: null },
  { id: '7', title: 'Vineyard Land with Water Source', location: 'Nashik, Maharashtra', area: '4', areaUnit: 'acres', price: 1200000, type: 'agricultural', highestBid: 1350000, bids: 7, verified: true, image: null },
  { id: '8', title: 'Premium Villa Plot', location: 'Gurgaon, Haryana', area: '3000', areaUnit: 'sqft', price: 4500000, type: 'residential', highestBid: 4700000, bids: 18, verified: true, image: null },
  { id: '9', title: 'Warehouse Zone Plot', location: 'Noida, UP', area: '10000', areaUnit: 'sqft', price: 5000000, type: 'industrial', highestBid: 5100000, bids: 6, verified: true, image: null },
  { id: '10', title: 'Tea Garden Land', location: 'Darjeeling, West Bengal', area: '5', areaUnit: 'acres', price: 2500000, type: 'agricultural', highestBid: 2700000, bids: 11, verified: true, image: null },
]

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_bids', label: 'Most Bids' },
]

function PropertiesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'all'

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedType, setSelectedType] = useState(initialCategory)
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [priceMax, setPriceMax] = useState(10000000)
  const [viewMode, setViewMode] = useState('grid')

  const filteredProperties = useMemo(() => {
    let results = ALL_PROPERTIES.filter((prop) => {
      const matchesSearch =
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || prop.type === selectedType
      const matchesPrice = prop.price <= priceMax
      return matchesSearch && matchesType && matchesPrice
    })

    switch (sortBy) {
      case 'price_low': results.sort((a, b) => a.price - b.price); break
      case 'price_high': results.sort((a, b) => b.price - a.price); break
      case 'most_bids': results.sort((a, b) => b.bids - a.bids); break
      default: break
    }

    return results
  }, [searchQuery, selectedType, sortBy, priceMax])

  const activeFilters = (selectedType !== 'all' ? 1 : 0) + (priceMax < 10000000 ? 1 : 0)

  return (
    <div className="bg-background min-h-screen">
      {/* Search Bar */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                className="pl-9 h-10 rounded-xl bg-muted text-foreground border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-transparent'
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border-b border-border px-4 py-4 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Property Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Max Price</p>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={100000}
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{"₹1L"}</span>
                <span className="font-medium text-foreground">
                  {"Up to ₹"}{priceMax >= 10000000 ? 'Any' : `${(priceMax / 100000).toFixed(0)}L`}
                </span>
                <span>{"₹1Cr"}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedType('all')
                  setPriceMax(10000000)
                  setSortBy('newest')
                }}
              >
                Clear All
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              {filteredProperties.length} properties found
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredProperties.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} compact={viewMode === 'grid'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No properties found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('all')
                  setPriceMax(10000000)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PropertiesContent />
    </Suspense>
  )
}
