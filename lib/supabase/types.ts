export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'employee' | 'driver' | 'admin'
export type CommuteRole = 'passenger' | 'driver' | 'either'
export type RideStatus = 'requested' | 'accepted' | 'confirmed' | 'started' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'due' | 'processing' | 'paid' | 'failed'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          role: UserRole
          avatar_url: string | null
          org_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          org_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          org_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commute_profiles: {
        Row: {
          id: string
          user_id: string
          home_address: string
          office_address: string
          departure_time: string
          return_time: string
          schedule_days: string[]
          pickup_preference: string
          commute_role: CommuteRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          home_address: string
          office_address: string
          departure_time: string
          return_time: string
          schedule_days?: string[]
          pickup_preference?: string
          commute_role?: CommuteRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          home_address?: string
          office_address?: string
          departure_time?: string
          return_time?: string
          schedule_days?: string[]
          pickup_preference?: string
          commute_role?: CommuteRole
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          model: string
          color: string
          license_plate: string
          vehicle_type: string
          total_seats: number
          available_seats: number
          has_ac: boolean
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          model: string
          color: string
          license_plate: string
          vehicle_type?: string
          total_seats?: number
          available_seats?: number
          has_ac?: boolean
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          model?: string
          color?: string
          license_plate?: string
          vehicle_type?: string
          total_seats?: number
          available_seats?: number
          has_ac?: boolean
          is_available?: boolean
          created_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          driver_id: string
          vehicle_id: string | null
          origin: string
          destination: string
          pickup_location: string
          departure_time: string
          eta: string
          total_cost: number
          price_per_passenger: number
          seats_available: number
          status: RideStatus
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          vehicle_id?: string | null
          origin: string
          destination: string
          pickup_location: string
          departure_time: string
          eta: string
          total_cost?: number
          price_per_passenger?: number
          seats_available?: number
          status?: RideStatus
          created_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          vehicle_id?: string | null
          origin?: string
          destination?: string
          pickup_location?: string
          departure_time?: string
          eta?: string
          total_cost?: number
          price_per_passenger?: number
          seats_available?: number
          status?: RideStatus
          created_at?: string
        }
      }
      ride_members: {
        Row: {
          id: string
          ride_id: string
          user_id: string
          pickup_location: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          user_id: string
          pickup_location: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          user_id?: string
          pickup_location?: string
          status?: string
          created_at?: string
        }
      }
      ride_requests: {
        Row: {
          id: string
          ride_id: string
          user_id: string
          pickup_location: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          user_id: string
          pickup_location: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          user_id?: string
          pickup_location?: string
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          ride_id: string
          passenger_id: string
          driver_id: string
          amount: number
          currency: string
          status: PaymentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          passenger_id: string
          driver_id: string
          amount: number
          currency?: string
          status?: PaymentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          passenger_id?: string
          driver_id?: string
          amount?: number
          currency?: string
          status?: PaymentStatus
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
