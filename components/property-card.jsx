'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { MapPin, TrendingUp, Heart } from 'lucide-react'
import { useState } from 'react'

export default function PropertyCard({ property, compact = false }) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  return (
    <div
      className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/properties/${property.id}`)}
      role="article"
    >
      <div className="relative">
        <div className={`${compact ? 'h-32' : 'h-44'} bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center`}>
          {property.image ? (
            <span className="text-5xl">{property.image}</span>
          ) : (
            <MapPin className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSaved(!saved)
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          aria-label={saved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
        </button>
        {property.verified && (
          <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5">
            Verified
          </Badge>
        )}
        {property.type && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 bg-card/80 backdrop-blur-sm text-foreground">
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </Badge>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">
              {property.bids ? `${property.bids} bids` : 'No bids yet'}
            </p>
            <p className="font-bold text-primary text-sm">
              {property.highestBid ? `₹${formatPrice(property.highestBid)}` : `₹${formatPrice(property.price)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{property.area} {property.areaUnit || ''}</p>
            {property.bids > 0 && <TrendingUp className="w-4 h-4 text-accent ml-auto" />}
          </div>
        </div>
      </div>
    </div>
  )
}
