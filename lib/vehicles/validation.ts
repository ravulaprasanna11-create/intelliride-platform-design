export interface VehicleInputData {
  model: string
  color: string
  licensePlate: string
  vehicleType: string
  totalSeats: number
  availableSeats: number
  hasAc: boolean
  isAvailable?: boolean
}

export function validateVehicleInput(body: any): { valid: boolean; error?: string; data?: VehicleInputData } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' }
  }

  const { model, color, licensePlate, vehicleType, totalSeats, availableSeats, hasAc, isAvailable } = body

  if (!model || typeof model !== 'string' || !model.trim()) {
    return { valid: false, error: 'Vehicle model is required' }
  }

  if (!licensePlate || typeof licensePlate !== 'string' || !licensePlate.trim()) {
    return { valid: false, error: 'License plate is required' }
  }

  const numTotalSeats = typeof totalSeats === 'number' ? totalSeats : parseInt(totalSeats) || 4
  const numAvailableSeats = typeof availableSeats === 'number' ? availableSeats : parseInt(availableSeats) || 2

  if (numTotalSeats <= 0) {
    return { valid: false, error: 'Total seats must be greater than 0' }
  }

  if (numAvailableSeats < 0) {
    return { valid: false, error: 'Available seats cannot be negative' }
  }

  if (numAvailableSeats > numTotalSeats) {
    return { valid: false, error: 'Available seats cannot exceed total seats' }
  }

  return {
    valid: true,
    data: {
      model: model.trim(),
      color: typeof color === 'string' && color.trim() ? color.trim() : 'Silver',
      licensePlate: licensePlate.trim().toUpperCase(),
      vehicleType: typeof vehicleType === 'string' && vehicleType.trim() ? vehicleType.trim() : 'Sedan',
      totalSeats: numTotalSeats,
      availableSeats: numAvailableSeats,
      hasAc: Boolean(hasAc ?? true),
      isAvailable: Boolean(isAvailable ?? true),
    },
  }
}
