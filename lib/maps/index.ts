export interface RouteEstimate {
  distanceKm: number
  durationMinutes: number
  detourMinutes: number
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`
}
