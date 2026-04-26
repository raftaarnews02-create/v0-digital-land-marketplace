'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { MapPin, TrendingUp, Heart, Gavel } from 'lucide-react'
import { useState } from 'react'

const CATEGORY_ICONS = {
  agricultural: '🌾',
  residential: '🏠',
  commercial: '🏢',
  industrial: '🏭',
}

export default function PropertyCard({ property, compact = false }) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const formatPrice = (price) => {
    if (!price) return '0'
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const propertyId = property._id || property.id
  const imageUrl = !imgError && property.images?.[0]
  const categoryIcon = CATEGORY_ICONS[property.category || property.type] || '🏡'
  const isClosed = property.status === 'closed'
  const bidCount = property.totalBids || property.bids || 0
  const displayPrice = property.highestBid || property.basePrice || property.price

  return (
    <div
      className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => router.push(`/properties/${propertyId}`)}
      role="article"
    >
      {/* Image */}
      <div className={`relative ${compact ? 'h-36' : 'h-48'} bg-gradient-to-br from-primary/15 to-accent/15`}>
        {imageUrl ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse flex items-center justify-center">
                <span className="text-4xl opacity-30">{categoryIcon}</span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">{categoryIcon}</span>
            {property.images?.length === 0 && (
              <span className="text-[10px] text-muted-foreground">No photos yet</span>
            )}
          </div>
        )}

        {/* Image count badge */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            +{property.images.length - 1} photos
          </div>
        )}

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved) }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          aria-label={saved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
        </button>

        {/* Status badges */}
        {isClosed && (
          <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 border border-border">
            Closed
          </Badge>
        )}
        {!isClosed && (property.status === 'active' || property.verified) && (
          <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5">
            Verified
          </Badge>
        )}

        {/* Category */}
        {(property.category || property.type) && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 bg-card/80 backdrop-blur-sm text-foreground">
            {(property.category || property.type)?.charAt(0).toUpperCase() + (property.category || property.type)?.slice(1)}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 leading-snug">{property.title}</h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs line-clamp-1">
            {property.location?.address
              ? `${property.location.address}, ${property.location.city}`
              : property.location?.city
              ? `${property.location.city}, ${property.location.state}`
              : property.location || 'Location not set'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div>
            <div className="flex items-center gap-1">
              {bidCount > 0 ? (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Gavel className="w-2.5 h-2.5" /> {bidCount} bid{bidCount !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">No bids yet</span>
              )}
            </div>
            <p className="font-bold text-primary text-sm">
              ₹{formatPrice(displayPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{property.area} {property.areaUnit || ''}</p>
            {bidCount > 0 && <TrendingUp className="w-3.5 h-3.5 text-accent ml-auto mt-0.5" />}
          </div>
        </div>
      </div>
    </div>
  )
}
