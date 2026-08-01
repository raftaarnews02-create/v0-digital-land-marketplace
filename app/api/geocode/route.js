import { NextResponse } from 'next/server';

/**
 * Thin proxy over OpenStreetMap's Nominatim service. Going through the server
 * keeps the browser free of CORS issues and lets us send the descriptive
 * User-Agent that Nominatim's usage policy asks for.
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'LandBid/1.0 (land marketplace; contact: support@landbid.in)';

async function callNominatim(path) {
  const res = await fetch(`${NOMINATIM}${path}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    // Nominatim results are stable enough to cache for a day
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Geocoding service returned ${res.status}`);
  return res.json();
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const query = params.get('q');
  const lat = params.get('lat');
  const lon = params.get('lon');

  try {
    // Reverse: coordinates -> address
    if (lat && lon) {
      const data = await callNominatim(
        `/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=14`
      );
      return NextResponse.json({
        displayName: data.display_name || '',
        address: data.address || {},
      });
    }

    // Forward: address -> coordinates. Restricted to India, which is the only
    // market this marketplace serves.
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Enter at least 3 characters to search' }, { status: 400 });
    }

    const data = await callNominatim(
      `/search?format=jsonv2&countrycodes=in&limit=5&q=${encodeURIComponent(query.trim())}`
    );

    return NextResponse.json({
      results: (Array.isArray(data) ? data : []).map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      })),
    });
  } catch (error) {
    console.error('[geocode] error:', error);
    return NextResponse.json({ error: 'Could not look up that location' }, { status: 502 });
  }
}
