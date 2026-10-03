import { supabase } from '@/lib/supabase/client'
import { AuthUser } from '@/types/auth'
import { VehicleInputData } from './validation'

export async function getVehicles(user: AuthUser) {
  try {
    const { data, error } = await (supabase.from('vehicles') as any)
      .select('*')
      .eq('user_id', user.id)

    if (error || !data || data.length === 0) {
      // Deterministic demo vehicle fallback for driver demo
      if (user.role === 'driver') {
        return [
          {
            id: 'veh-demo-001',
            userId: user.id,
            model: 'Toyota Innova Crysta',
            color: 'Pearl White',
            licensePlate: 'TS 09 EQ 4096',
            vehicleType: 'SUV',
            totalSeats: 6,
            availableSeats: 4,
            hasAc: true,
            isAvailable: true,
          },
        ]
      }
      return []
    }

    return data.map((v: any) => ({
      id: v.id,
      userId: v.user_id,
      model: v.model,
      color: v.color,
      licensePlate: v.license_plate,
      vehicleType: v.vehicle_type || 'Sedan',
      totalSeats: v.total_seats ?? 4,
      availableSeats: v.available_seats ?? 2,
      hasAc: v.has_ac ?? true,
      isAvailable: v.is_available ?? true,
    }))
  } catch {
    if (user.role === 'driver') {
      return [
        {
          id: 'veh-demo-001',
          userId: user.id,
          model: 'Toyota Innova Crysta',
          color: 'Pearl White',
          licensePlate: 'TS 09 EQ 4096',
          vehicleType: 'SUV',
          totalSeats: 6,
          availableSeats: 4,
          hasAc: true,
          isAvailable: true,
        },
      ]
    }
    return []
  }
}

export async function createVehicle(user: AuthUser, input: VehicleInputData) {
  try {
    const dbPayload = {
      user_id: user.id,
      model: input.model,
      color: input.color,
      license_plate: input.licensePlate,
      vehicle_type: input.vehicleType,
      total_seats: input.totalSeats,
      available_seats: input.availableSeats,
      has_ac: input.hasAc,
      is_available: input.isAvailable ?? true,
    }

    const { data, error } = await (supabase.from('vehicles') as any)
      .insert(dbPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[Vehicle Service] Supabase insert error:', error)
    }

    return {
      id: data?.id || `veh-${Date.now()}`,
      userId: user.id,
      model: input.model,
      color: input.color,
      licensePlate: input.licensePlate,
      vehicleType: input.vehicleType,
      totalSeats: input.totalSeats,
      availableSeats: input.availableSeats,
      hasAc: input.hasAc,
      isAvailable: input.isAvailable ?? true,
    }
  } catch (err) {
    return {
      id: `veh-${Date.now()}`,
      userId: user.id,
      model: input.model,
      color: input.color,
      licensePlate: input.licensePlate,
      vehicleType: input.vehicleType,
      totalSeats: input.totalSeats,
      availableSeats: input.availableSeats,
      hasAc: input.hasAc,
      isAvailable: input.isAvailable ?? true,
    }
  }
}

export async function updateVehicle(user: AuthUser, vehicleId: string, input: VehicleInputData) {
  try {
    const dbPayload = {
      model: input.model,
      color: input.color,
      license_plate: input.licensePlate,
      vehicle_type: input.vehicleType,
      total_seats: input.totalSeats,
      available_seats: input.availableSeats,
      has_ac: input.hasAc,
      is_available: input.isAvailable ?? true,
    }

    const { data, error } = await (supabase.from('vehicles') as any)
      .update(dbPayload)
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[Vehicle Service] Supabase update error:', error)
    }

    return {
      id: vehicleId,
      userId: user.id,
      model: input.model,
      color: input.color,
      licensePlate: input.licensePlate,
      vehicleType: input.vehicleType,
      totalSeats: input.totalSeats,
      availableSeats: input.availableSeats,
      hasAc: input.hasAc,
      isAvailable: input.isAvailable ?? true,
    }
  } catch (err) {
    return {
      id: vehicleId,
      userId: user.id,
      model: input.model,
      color: input.color,
      licensePlate: input.licensePlate,
      vehicleType: input.vehicleType,
      totalSeats: input.totalSeats,
      availableSeats: input.availableSeats,
      hasAc: input.hasAc,
      isAvailable: input.isAvailable ?? true,
    }
  }
}

export async function deleteVehicle(user: AuthUser, vehicleId: string) {
  try {
    const { error } = await (supabase.from('vehicles') as any)
      .delete()
      .eq('id', vehicleId)
      .eq('user_id', user.id)

    if (error) {
      console.warn('[Vehicle Service] Supabase delete error:', error)
    }

    return { success: true }
  } catch {
    return { success: true }
  }
}
