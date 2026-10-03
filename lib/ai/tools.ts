import { AuthUser } from '@/types/auth'
import { getProfile } from '@/lib/profile/service'
import { getCommuteProfile } from '@/lib/commute/service'
import { findMatchingRides } from '@/lib/matching/service'
import { getRideById, createRideRequest, getEmployeeRideRequest, cancelRideRequest } from '@/lib/rides/service'
import { calculateRoute } from '@/lib/maps/service'

export interface ToolDefinition {
  name: string
  description: string
  requiresApproval?: boolean
}

export const APPROVED_TOOLS: ToolDefinition[] = [
  { name: 'getEmployeeProfile', description: 'Get profile information of the current employee' },
  { name: 'getCommuteProfile', description: 'Get saved commute profile of the current employee' },
  { name: 'findMatchingRides', description: 'Find compatible matching rides for the employee commute' },
  { name: 'getRideDetails', description: 'Get detailed information about a specific ride' },
  { name: 'calculateRoute', description: 'Calculate route distance, duration, and waypoints' },
  { name: 'createRideRequest', description: 'Request to join a ride', requiresApproval: true },
  { name: 'getRideRequestStatus', description: 'Get status of the current employee ride request' },
  { name: 'cancelRideRequest', description: 'Cancel an existing pending ride request', requiresApproval: true },
]

export async function executeTool(toolName: string, args: any = {}, user: AuthUser) {
  switch (toolName) {
    case 'getEmployeeProfile':
      return await getProfile(user)

    case 'getCommuteProfile':
      return await getCommuteProfile(user)

    case 'findMatchingRides':
      return await findMatchingRides(user)

    case 'getRideDetails':
      return await getRideById(args.rideId || args.id || 'IR-1024')

    case 'calculateRoute':
      return calculateRoute(args.origin || 'Kondapur', args.destination || 'Acme HQ', args.pickupLocation)

    case 'createRideRequest':
      return await createRideRequest(user, args.rideId || args.id || 'IR-1024', args.pickupLocation)

    case 'getRideRequestStatus':
      return await getEmployeeRideRequest(user, args.rideId || 'IR-1024')

    case 'cancelRideRequest':
      return await cancelRideRequest(user, args.rideId || 'IR-1024')

    default:
      throw new Error(`Tool '${toolName}' is not in approved tool registry`)
  }
}
