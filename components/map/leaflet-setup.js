import L from 'leaflet'

/**
 * Leaflet's default marker points at image files by relative URL, which breaks
 * under a bundler. A divIcon keeps everything inline — no external assets.
 */
export const pinIcon = L.divIcon({
  className: 'landbid-pin',
  html: `
    <span style="
      display:block;width:30px;height:42px;
      filter:drop-shadow(0 3px 4px rgba(0,0,0,.35));
    ">
      <svg viewBox="0 0 30 42" width="30" height="42" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 11.3 15 27 15 27s15-15.7 15-27c0-8.3-6.7-15-15-15z" fill="#0b5cab"/>
        <circle cx="15" cy="15" r="6" fill="#fff"/>
      </svg>
    </span>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
})

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Centre of India — used when a listing has no coordinates yet. */
export const INDIA_CENTER = [22.35, 78.66]
