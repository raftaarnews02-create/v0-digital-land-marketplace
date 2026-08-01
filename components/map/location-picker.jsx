'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pinIcon, TILE_URL, TILE_ATTRIBUTION, INDIA_CENTER } from './leaflet-setup'
import { Search, Crosshair, Loader2, MapPin, X } from 'lucide-react'

/** Moves the map when the chosen position changes from outside the map. */
function Recenter({ position, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, zoom ?? map.getZoom(), { duration: 0.6 })
  }, [position?.[0], position?.[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/** Leaflet mis-measures itself when it mounts inside a hidden container. */
function FixSize() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function ClickToPlace({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) })
  return null
}

/**
 * Map used by sellers to pin exactly where their land is.
 *
 * @param {object} props
 * @param {{lat:number,lng:number}|null} props.value
 * @param {(value:{lat:number,lng:number,address:string}|null) => void} props.onChange
 * @param {string} props.searchHint  address typed elsewhere in the form, used as the initial lookup
 */
export default function LocationPicker({ value, onChange, searchHint = '' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const lastResolved = useRef(null)

  const position = value ? [value.lat, value.lng] : null

  const runSearch = async (term) => {
    const text = (term ?? query).trim()
    if (text.length < 3) {
      setError('Type at least 3 characters to search')
      return
    }
    setError('')
    setSearching(true)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data.results || [])
      if (!data.results?.length) setError('No matching place found. Try a nearby town or landmark.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  const pick = (coords) => {
    setResults([])
    onChange({ lat: coords[0], lng: coords[1], address: '' })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser cannot share a location')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Allow location access or search instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Resolve a readable address whenever the pin moves
  useEffect(() => {
    if (!value) { setAddress(''); return }
    const key = `${value.lat.toFixed(5)},${value.lng.toFixed(5)}`
    if (lastResolved.current === key) return
    lastResolved.current = key

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?lat=${value.lat}&lon=${value.lng}`)
        const data = await res.json()
        if (!cancelled && res.ok) {
          setAddress(data.displayName || '')
          onChange({ lat: value.lat, lng: value.lng, address: data.displayName || '' })
        }
      } catch {}
    }, 500)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [value?.lat, value?.lng]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch() } }}
            placeholder={searchHint ? `Search ${searchHint}...` : 'Search village, town or landmark'}
            className="w-full h-11 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={searching}
          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          title="Use my current location"
          className="h-11 w-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-60"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4 text-primary" />}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {results.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => { pick([result.lat, result.lng]); setQuery('') }}
                className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{result.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border relative">
        <MapContainer
          center={position || INDIA_CENTER}
          zoom={position ? 15 : 5}
          scrollWheelZoom
          style={{ height: '320px', width: '100%' }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <FixSize />
          <Recenter position={position} zoom={15} />
          <ClickToPlace onPick={pick} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  pick([lat, lng])
                },
              }}
            />
          )}
        </MapContainer>

        {!position && (
          <div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border px-3 py-2 pointer-events-none z-[500]">
            <p className="text-xs text-muted-foreground text-center">
              Tap anywhere on the map to drop a pin on your land
            </p>
          </div>
        )}
      </div>

      {/* Selection summary */}
      {position && (
        <div className="rounded-xl bg-muted/60 p-3 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">Pinned location</p>
            <p className="text-xs text-muted-foreground mt-0.5 break-words">
              {address || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setAddress('') }}
            className="w-6 h-6 rounded-full bg-background flex items-center justify-center flex-shrink-0"
            aria-label="Remove pin"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}
