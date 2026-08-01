'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pinIcon, TILE_URL, TILE_ATTRIBUTION } from './leaflet-setup'
import { ExternalLink, Navigation } from 'lucide-react'

function FixSize() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

/**
 * Read-only map shown to buyers so they can see where a plot actually is.
 *
 * @param {object} props
 * @param {number} props.lat
 * @param {number} props.lng
 * @param {string} [props.label]     caption under the map
 * @param {boolean} [props.approximate]  draw a radius instead of an exact pin
 * @param {string} [props.height]
 */
export default function PropertyMap({ lat, lng, label, approximate = false, height = '280px' }) {
  const position = [lat, lng]

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={position}
          zoom={approximate ? 13 : 15}
          scrollWheelZoom={false}
          style={{ height, width: '100%' }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <FixSize />
          {approximate ? (
            <Circle center={position} radius={700} pathOptions={{ color: '#0b5cab', fillOpacity: 0.15 }} />
          ) : (
            <Marker position={position} icon={pinIcon} />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-3">
        {label && <p className="text-xs text-muted-foreground truncate">{label}</p>}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Larger map
          </a>
        </div>
      </div>
    </div>
  )
}
