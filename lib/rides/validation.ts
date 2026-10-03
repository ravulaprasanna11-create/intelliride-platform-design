export interface CreateRideInput {
  origin: string
  destination: string
  pickupLocation: string
  departureTime: string
  eta: string
  vehicleId: string
  totalCost: number
  pricePerPassenger: number
  seatsAvailable: number
}

export function validateCreateRideInput(body: any, vehicleTotalSeats: number = 4): { valid: boolean; error?: string; data?: CreateRideInput } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' }
  }

  const { origin, destination, pickupLocation, departureTime, eta, vehicleId, totalCost, pricePerPassenger, seatsAvailable } = body

  if (!origin || typeof origin !== 'string' || !origin.trim()) {
    return { valid: false, error: 'Origin location is required' }
  }

  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    return { valid: false, error: 'Destination location is required' }
  }

  if (!departureTime || typeof departureTime !== 'string' || !departureTime.trim()) {
    return { valid: false, error: 'Departure time is required' }
  }

  if (!vehicleId || typeof vehicleId !== 'string' || !vehicleId.trim()) {
    return { valid: false, error: 'Vehicle selection is required' }
  }

  const numSeats = typeof seatsAvailable === 'number' ? seatsAvailable : parseInt(seatsAvailable) || 2
  if (numSeats <= 0) {
    return { valid: false, error: 'Available seats must be greater than 0' }
  }

  if (numSeats > vehicleTotalSeats) {
    return { valid: false, error: `Available seats (${numSeats}) cannot exceed vehicle total capacity (${vehicleTotalSeats})` }
  }

  const cost = typeof totalCost === 'number' ? totalCost : parseInt(totalCost) || 300
  const price = typeof pricePerPassenger === 'number' ? pricePerPassenger : parseInt(pricePerPassenger) || 100

  if (cost < 0) {
    return { valid: false, error: 'Total cost cannot be negative' }
  }

  if (price < 0) {
    return { valid: false, error: 'Price per passenger cannot be negative' }
  }

  return {
    valid: true,
    data: {
      origin: origin.trim(),
      destination: destination.trim(),
      pickupLocation: typeof pickupLocation === 'string' && pickupLocation.trim() ? pickupLocation.trim() : origin.trim(),
      departureTime: departureTime.trim(),
      eta: typeof eta === 'string' && eta.trim() ? eta.trim() : '8:48 AM',
      vehicleId: vehicleId.trim(),
      totalCost: cost,
      pricePerPassenger: price,
      seatsAvailable: numSeats,
    },
  }
}
