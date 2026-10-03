export type UserRole = 'employee' | 'driver' | 'admin'

export type AuthUser = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role: UserRole
  avatarUrl?: string | null
}

export interface VehicleInput {
  model: string
  color?: string
  licensePlate: string
  vehicleType?: string
  totalSeats?: number
  availableSeats?: number
  hasAc?: boolean
}

export type AuthContextValue = {
  user: AuthUser | null
  isInitialized: boolean
  isSupabaseActive: boolean
  hasVehicle: boolean
  loginAs: (role: UserRole) => void
  signInWithPassword: (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<{ error?: string | null; needsVehicleOnboarding?: boolean }>
  signUp: (
    email: string,
    password: string,
    name: string,
    role: 'employee' | 'driver',
    vehicleDetails?: VehicleInput
  ) => Promise<{ error?: string | null; confirmationRequired?: boolean }>
  saveDriverVehicle: (vehicle: VehicleInput) => Promise<{ error?: string | null }>
  logout: () => Promise<void>
}
