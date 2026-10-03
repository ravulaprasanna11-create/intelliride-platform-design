import type { Ride } from '@/types/ride'
import type { PaymentStatus } from '@/types/payment'

export const defaultRides: Ride[] = [
  {
    id: 'IR-1024',
    driver: 'Rohan Shah',
    vehicle: 'Honda City · Silver',
    from: 'Kondapur',
    pickup: 'Hitech City Metro',
    to: 'Acme HQ',
    time: '8:20 AM',
    arrival: '8:48 AM',
    match: '92%',
    seats: 2,
    status: 'Confirmed',
    detour: '5 min',
    pricePerPassenger: 100,
    totalEstimatedCost: 300,
    driverExpectedEarnings: 300,
    paymentStatus: 'pending',
  },
  {
    id: 'IR-1028',
    driver: 'Priya Mehta',
    vehicle: 'Hyundai Creta · White',
    from: 'Jubilee Hills',
    pickup: 'Checkpost',
    to: 'Acme HQ',
    time: '8:25 AM',
    arrival: '8:55 AM',
    match: '87%',
    seats: 3,
    status: 'Requested',
    detour: '9 min',
    pricePerPassenger: 120,
    totalEstimatedCost: 360,
    driverExpectedEarnings: 360,
    paymentStatus: 'pending',
  },
  {
    id: 'IR-1031',
    driver: 'Arjun Kumar',
    vehicle: 'Toyota Glanza · Blue',
    from: 'Gachibowli',
    pickup: 'Kondapur RTO',
    to: 'Acme HQ',
    time: '8:35 AM',
    arrival: '9:02 AM',
    match: '81%',
    seats: 1,
    status: 'Accepted',
    detour: '12 min',
    pricePerPassenger: 90,
    totalEstimatedCost: 270,
    driverExpectedEarnings: 270,
    paymentStatus: 'pending',
  },
]

export const calculateRideFare = (totalEstimatedCost: number, passengers: number): number => {
  if (passengers <= 0) return totalEstimatedCost
  return Math.ceil(totalEstimatedCost / passengers)
}

export const calculateDriverEarnings = (pricePerPassenger: number, passengers: number): number => {
  return pricePerPassenger * passengers
}

export const paymentLabel = (status: PaymentStatus, amount: number): string => {
  if (status === 'paid') return 'Paid'
  if (status === 'due') return `₹${amount} Due`
  return 'Pending after ride'
}
