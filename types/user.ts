import type { UserRole } from './auth'

export type CommuteRole = 'passenger' | 'driver' | 'either'

export interface UserProfile {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role: UserRole
  avatarUrl?: string | null
  orgId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Organization {
  id: string
  name: string
  domain: string
  createdAt?: string
}

export interface CommuteProfile {
  id: string
  userId: string
  homeAddress: string
  officeAddress: string
  departureTime: string
  returnTime: string
  scheduleDays: string[]
  pickupPreference: string
  commuteRole: CommuteRole
  createdAt?: string
  updatedAt?: string
}
