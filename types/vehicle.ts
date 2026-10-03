export interface Vehicle {
  id: string
  userId: string
  model: string
  color: string
  licensePlate: string
  vehicleType: string
  totalSeats: number
  availableSeats: number
  hasAc: boolean
  isAvailable: boolean
  createdAt?: string
}
