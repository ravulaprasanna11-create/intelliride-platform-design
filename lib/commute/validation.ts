export interface CommuteProfileInput {
  origin: string
  destination: string
  departureTime?: string
  returnTime?: string
  pickupPreference?: string
  commuteRole?: 'passenger' | 'driver' | 'either'
  scheduleDays?: string[]
}

export function validateCommuteInput(body: any): { valid: boolean; error?: string; data?: CommuteProfileInput } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' }
  }

  const { origin, destination, departureTime, returnTime, pickupPreference, commuteRole, scheduleDays } = body

  if (!origin || typeof origin !== 'string' || !origin.trim()) {
    return { valid: false, error: 'Origin location is required' }
  }

  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    return { valid: false, error: 'Destination location is required' }
  }

  const cleanData: CommuteProfileInput = {
    origin: origin.trim(),
    destination: destination.trim(),
    departureTime: typeof departureTime === 'string' && departureTime.trim() ? departureTime.trim() : '08:30 AM',
    returnTime: typeof returnTime === 'string' && returnTime.trim() ? returnTime.trim() : '05:30 PM',
    pickupPreference: typeof pickupPreference === 'string' && pickupPreference.trim() ? pickupPreference.trim() : 'Nearby landmark',
    commuteRole: ['passenger', 'driver', 'either'].includes(commuteRole) ? commuteRole : 'passenger',
    scheduleDays: Array.isArray(scheduleDays) ? scheduleDays : ['M', 'T', 'W', 'T', 'F'],
  }

  return { valid: true, data: cleanData }
}
