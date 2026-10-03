export interface MapCoordinates {
  lat: number
  lng: number
}

export interface WaypointItem {
  lat: number
  lng: number
  label: string
  type: 'origin' | 'pickup' | 'destination'
}

export interface RouteResult {
  origin: string
  destination: string
  pickupLocation?: string
  distanceKm: number
  durationMinutes: number
  originCoords: MapCoordinates
  destinationCoords: MapCoordinates
  pickupCoords?: MapCoordinates
  waypoints: WaypointItem[]
  svgPath: string
  encodedPolyline?: string
  isRealGoogleRoute?: boolean
}

// Known coordinates for Hyderabad tech corridor landmarks
const KNOWN_LOCATIONS: Record<string, MapCoordinates> = {
  kondapur: { lat: 17.4600, lng: 78.3650 },
  'hitech city': { lat: 17.4435, lng: 78.3772 },
  'hitech city metro': { lat: 17.4435, lng: 78.3772 },
  gachibowli: { lat: 17.4401, lng: 78.3489 },
  'jubilee hills': { lat: 17.4319, lng: 78.4071 },
  'jubilee hills checkpost': { lat: 17.4319, lng: 78.4071 },
  'acme hq': { lat: 17.4485, lng: 78.3800 },
  office: { lat: 17.4485, lng: 78.3800 },
  home: { lat: 17.4600, lng: 78.3650 },
  'kondapur rto': { lat: 17.4580, lng: 78.3620 },
}

function resolveCoordinates(locationName: string, defaultLat = 17.4450, defaultLng = 78.3700): MapCoordinates {
  if (!locationName) return { lat: defaultLat, lng: defaultLng }

  const clean = locationName.toLowerCase().trim()
  
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords
    }
  }

  const match = locationName.match(/\(([-+]?\d*\.?\d+),\s*([-+]?\d*\.?\d+)\)/)
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash)
  }
  const latOffset = ((hash % 100) / 2000)
  const lngOffset = (((hash >> 2) % 100) / 2000)

  return {
    lat: Number((defaultLat + latOffset).toFixed(4)),
    lng: Number((defaultLng + lngOffset).toFixed(4)),
  }
}

function calculateHaversineDistance(c1: MapCoordinates, c2: MapCoordinates): number {
  const R = 6371
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(1.5, Number((R * c * 1.35).toFixed(1)))
}

function generateSvgPath(originCoords: MapCoordinates, destCoords: MapCoordinates, pickupCoords?: MapCoordinates): string {
  const origX = 105
  const origY = 270
  const destX = 520
  const destY = 42

  if (pickupCoords) {
    const pickX = 302
    const pickY = 166
    return `M${origX} ${origY} C170 220, 225 198, ${pickX} ${pickY} S410 95, ${destX} ${destY}`
  }

  return `M${origX} ${origY} C170 220, 280 180, 360 120 S430 70, ${destX} ${destY}`
}

export async function calculateRouteAsync(
  origin: string,
  destination: string,
  pickupLocation?: string
): Promise<RouteResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY

  const origName = origin || 'Kondapur, Hyderabad'
  const destName = destination || 'Acme HQ, Hitech City'

  if (apiKey && !apiKey.includes('demo_') && !apiKey.includes('your_')) {
    try {
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origName)}&destination=${encodeURIComponent(destName)}&key=${apiKey}`
      if (pickupLocation) {
        url += `&waypoints=via:${encodeURIComponent(pickupLocation)}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const totalDistanceMeters = route.legs.reduce((acc: number, leg: any) => acc + (leg.distance?.value || 0), 0)
        const totalDurationSeconds = route.legs.reduce((acc: number, leg: any) => acc + (leg.duration?.value || 0), 0)

        const distanceKm = Number((totalDistanceMeters / 1000).toFixed(1))
        const durationMinutes = Math.round(totalDurationSeconds / 60)

        const firstLeg = route.legs[0]
        const lastLeg = route.legs[route.legs.length - 1]

        const originCoords = { lat: firstLeg.start_location.lat, lng: firstLeg.start_location.lng }
        const destinationCoords = { lat: lastLeg.end_location.lat, lng: lastLeg.end_location.lng }

        let pickupCoords: MapCoordinates | undefined = undefined
        if (pickupLocation && route.legs.length > 1) {
          pickupCoords = { lat: firstLeg.end_location.lat, lng: firstLeg.end_location.lng }
        } else if (pickupLocation) {
          pickupCoords = resolveCoordinates(pickupLocation, 17.4435, 78.3772)
        }

        const waypoints: WaypointItem[] = [
          { ...originCoords, label: origName, type: 'origin' },
        ]
        if (pickupLocation && pickupCoords) {
          waypoints.push({ ...pickupCoords, label: pickupLocation, type: 'pickup' })
        }
        waypoints.push({ ...destinationCoords, label: destName, type: 'destination' })

        return {
          origin: origName,
          destination: destName,
          pickupLocation,
          distanceKm,
          durationMinutes,
          originCoords,
          destinationCoords,
          pickupCoords,
          waypoints,
          svgPath: generateSvgPath(originCoords, destinationCoords, pickupCoords),
          encodedPolyline: route.overview_polyline?.points,
          isRealGoogleRoute: true,
        }
      }
    } catch (e) {
      console.warn('[Google Maps Service] Directions API request failed, using fallback:', e)
    }
  }

  // Synchronous deterministic fallback if API key is missing or call fails
  return calculateRoute(origin, destination, pickupLocation)
}

export function calculateRoute(
  origin: string,
  destination: string,
  pickupLocation?: string
): RouteResult {
  const origName = origin || 'Kondapur, Hyderabad'
  const destName = destination || 'Acme HQ, Hitech City'

  const originCoords = resolveCoordinates(origName, 17.4600, 78.3650)
  const destinationCoords = resolveCoordinates(destName, 17.4485, 78.3800)
  
  let pickupCoords: MapCoordinates | undefined = undefined
  if (pickupLocation) {
    pickupCoords = resolveCoordinates(pickupLocation, 17.4435, 78.3772)
  }

  let distanceKm = calculateHaversineDistance(originCoords, destinationCoords)
  if (pickupCoords) {
    const d1 = calculateHaversineDistance(originCoords, pickupCoords)
    const d2 = calculateHaversineDistance(pickupCoords, destinationCoords)
    distanceKm = Math.max(distanceKm, Number((d1 + d2 * 0.8).toFixed(1)))
  }

  const durationMinutes = Math.max(8, Math.round(distanceKm * 2.2 + 3))

  const waypoints: WaypointItem[] = [
    { ...originCoords, label: origName, type: 'origin' },
  ]
  if (pickupLocation && pickupCoords) {
    waypoints.push({ ...pickupCoords, label: pickupLocation, type: 'pickup' })
  }
  waypoints.push({ ...destinationCoords, label: destName, type: 'destination' })

  const svgPath = generateSvgPath(originCoords, destinationCoords, pickupCoords)

  return {
    origin: origName,
    destination: destName,
    pickupLocation,
    distanceKm,
    durationMinutes,
    originCoords,
    destinationCoords,
    pickupCoords,
    waypoints,
    svgPath,
    isRealGoogleRoute: false,
  }
}
