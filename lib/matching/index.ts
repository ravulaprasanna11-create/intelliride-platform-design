export interface MatchCriteria {
  origin: string
  destination: string
  departureTime: string
  maxDetourMinutes?: number
}

export function rankMatches(score: number): 'Excellent' | 'Good' | 'Moderate' {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  return 'Moderate'
}
