export type PaymentStatus = 'pending' | 'due' | 'processing' | 'paid' | 'failed'

export interface Payment {
  id: string
  rideId: string
  passengerId: string
  driverId: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: string
  updatedAt?: string
}

export interface DriverEarningsSummary {
  expectedEarnings: number
  paidEarnings: number
  pendingDue: number
  fuelCostOffset: number
}
