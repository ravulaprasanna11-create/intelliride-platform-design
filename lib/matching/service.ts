import { AuthUser } from '@/types/auth'
import { getCommuteProfile } from '@/lib/commute/service'
import { getAvailableRides } from '@/lib/rides/service'
import { calculateRoute } from '@/lib/maps/service'
import { rankMatches } from './index'

export interface RideMatchResult {
  ride: any
  score: number
  rankText: 'Excellent' | 'Good' | 'Moderate'
  distanceKm: number
  timeDifferenceMinutes: number
  reasons: string[]
}

export interface FindMatchesResponse {
  success: boolean
  data: {
    matches: RideMatchResult[]
    totalMatches: number
    employeeCommute: {
      origin: string
      destination: string
      departureTime: string
    }
  }
  error?: string
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 8 * 60 + 30 // Default 8:30 AM
  
  // Clean string e.g. "8:20 AM", "08:30 AM", "8:20"
  const clean = timeStr.trim().toUpperCase()
  const isPM = clean.includes('PM')
  const isAM = clean.includes('AM')

  const timePart = clean.replace(/(AM|PM)/g, '').trim()
  const parts = timePart.split(':')

  let hours = parseInt(parts[0], 10) || 8
  const minutes = parseInt(parts[1], 10) || 0

  if (isPM && hours < 12) hours += 12
  if (isAM && hours === 12) hours = 0

  return hours * 60 + minutes
}

export async function findMatchingRides(user: AuthUser): Promise<FindMatchesResponse> {
  try {
    const commute = await getCommuteProfile(user)
    const availableRides = await getAvailableRides()

    const empOrigin = commute.origin || 'Kondapur, Hyderabad'
    const empDestination = commute.destination || 'Acme HQ, Hitech City'
    const empTime = commute.departureTime || '8:30 AM'

    const empTimeMinutes = parseTimeToMinutes(empTime)

    // Filter valid rides (active, seats available, not driver's own ride)
    const candidates = availableRides.filter((ride: any) => {
      if (ride.driverId === user.id) return false
      if (ride.status === 'cancelled') return false
      if ((ride.seatsAvailable ?? ride.seats ?? 0) <= 0) return false
      return true
    })

    const matches: RideMatchResult[] = candidates.map((ride: any) => {
      const rideOrigin = ride.origin || ride.from || 'Kondapur'
      const rideDestination = ride.destination || ride.to || 'Acme HQ'
      const ridePickup = ride.pickupLocation || ride.pickup || rideOrigin
      const rideTime = ride.departureTime || ride.time || '8:20 AM'
      const seats = ride.seatsAvailable ?? ride.seats ?? 1

      // 1. Route & Proximity Calculation
      const routeInfo = calculateRoute(empOrigin, empDestination, ridePickup)
      const distanceKm = routeInfo.distanceKm

      // Route Scoring (0-40 points)
      let routeScore = 20
      const origLower = empOrigin.toLowerCase()
      const destLower = empDestination.toLowerCase()
      const rOrigLower = rideOrigin.toLowerCase()
      const rDestLower = rideDestination.toLowerCase()

      if (origLower.includes(rOrigLower) || rOrigLower.includes(origLower)) {
        routeScore += 10
      } else {
        routeScore += 5
      }

      if (destLower.includes(rDestLower) || rDestLower.includes(destLower)) {
        routeScore += 10
      } else {
        routeScore += 5
      }

      // 2. Time Compatibility (0-25 points)
      const rideTimeMinutes = parseTimeToMinutes(rideTime)
      const timeDiff = Math.abs(empTimeMinutes - rideTimeMinutes)

      let timeScore = 0
      if (timeDiff <= 10) timeScore = 25
      else if (timeDiff <= 20) timeScore = 20
      else if (timeDiff <= 30) timeScore = 15
      else if (timeDiff <= 45) timeScore = 10
      else if (timeDiff <= 60) timeScore = 5

      // 3. Pickup Proximity (0-15 points)
      let pickupScore = 10
      if (ridePickup && origLower.includes(ridePickup.toLowerCase())) {
        pickupScore = 15
      }

      // 4. Capacity / Available Seats (0-10 points)
      let capacityScore = 5
      if (seats >= 3) capacityScore = 10
      else if (seats === 2) capacityScore = 8

      // 5. Ride Status & Reliability (0-10 points)
      const preferenceScore = 10

      // Total Score (Max 100)
      const score = Math.min(100, routeScore + timeScore + pickupScore + capacityScore + preferenceScore)

      // Reasons list
      const reasons: string[] = []
      if (routeScore >= 30) {
        reasons.push(`Direct route match from ${rideOrigin} to ${rideDestination}`)
      } else {
        reasons.push(`Compatible commute route near your location`)
      }

      if (timeDiff <= 15) {
        reasons.push(`Departure time (${rideTime}) matches your preferred schedule (${empTime})`)
      } else if (timeDiff <= 35) {
        reasons.push(`Departure time (${rideTime}) is within ${timeDiff} mins of your preferred time`)
      } else {
        reasons.push(`Departure time: ${rideTime}`)
      }

      if (ridePickup) {
        reasons.push(`Pickup point at ${ridePickup} is nearby`)
      }

      reasons.push(`${seats} seat${seats > 1 ? 's' : ''} available`)

      return {
        ride,
        score,
        rankText: rankMatches(score),
        distanceKm,
        timeDifferenceMinutes: timeDiff,
        reasons,
      }
    })

    // Sort descending by score
    matches.sort((a, b) => b.score - a.score)

    return {
      success: true,
      data: {
        matches,
        totalMatches: matches.length,
        employeeCommute: {
          origin: empOrigin,
          destination: empDestination,
          departureTime: empTime,
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Unable to calculate matching rides',
      data: {
        matches: [],
        totalMatches: 0,
        employeeCommute: {
          origin: 'Kondapur',
          destination: 'Acme HQ',
          departureTime: '8:30 AM',
        },
      },
    }
  }
}
