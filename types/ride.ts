import type { PaymentStatus } from './payment'
export type { PaymentStatus }

export type RideStatus = 'Requested' | 'Accepted' | 'Confirmed' | 'Started' | 'Completed' | 'Cancelled'

export type Ride = {
  id: string
  driver: string
  vehicle: string
  from: string
  pickup: string
  to: string
  time: string
  arrival: string
  match: string
  seats: number
  status: RideStatus
  detour: string
  pricePerPassenger: number
  totalEstimatedCost: number
  driverExpectedEarnings: number
  paymentStatus: PaymentStatus
}

export interface RideMember {
  id: string
  rideId: string
  userId: string
  pickupLocation: string
  status: string
  createdAt?: string
}

export interface RideRequest {
  id: string
  rideId: string
  userId: string
  pickupLocation: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt?: string
}
