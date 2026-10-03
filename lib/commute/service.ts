import { supabase } from '@/lib/supabase/client'
import { AuthUser } from '@/types/auth'
import { CommuteProfileInput } from './validation'

export async function getCommuteProfile(user: AuthUser) {
  try {
    const { data, error } = await (supabase.from('commute_profiles') as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !data) {
      return {
        userId: user.id,
        origin: 'Hitech City, Hyderabad',
        destination: 'Gachibowli Tech Park, Hyderabad',
        departureTime: '08:30 AM',
        returnTime: '05:30 PM',
        pickupPreference: 'Main Gate Landmark',
        commuteRole: user.role === 'driver' ? 'driver' : 'passenger',
        scheduleDays: ['M', 'T', 'W', 'T', 'F'],
      }
    }

    return {
      id: data.id,
      userId: data.user_id,
      origin: data.home_address || 'Hitech City, Hyderabad',
      destination: data.office_address || 'Gachibowli Tech Park, Hyderabad',
      departureTime: data.departure_time || '08:30 AM',
      returnTime: data.return_time || '05:30 PM',
      pickupPreference: data.pickup_preference || 'Nearby landmark',
      commuteRole: data.commute_role || 'passenger',
      scheduleDays: data.schedule_days || ['M', 'T', 'W', 'T', 'F'],
    }
  } catch (err) {
    return {
      userId: user.id,
      origin: 'Hitech City, Hyderabad',
      destination: 'Gachibowli Tech Park, Hyderabad',
      departureTime: '08:30 AM',
      returnTime: '05:30 PM',
      pickupPreference: 'Main Gate Landmark',
      commuteRole: user.role === 'driver' ? 'driver' : 'passenger',
      scheduleDays: ['M', 'T', 'W', 'T', 'F'],
    }
  }
}

export async function saveCommuteProfile(user: AuthUser, input: CommuteProfileInput) {
  try {
    const dbPayload = {
      user_id: user.id,
      home_address: input.origin,
      office_address: input.destination,
      departure_time: input.departureTime || '08:30 AM',
      return_time: input.returnTime || '05:30 PM',
      pickup_preference: input.pickupPreference || 'Nearby landmark',
      commute_role: input.commuteRole || (user.role === 'driver' ? 'driver' : 'passenger'),
      schedule_days: input.scheduleDays || ['M', 'T', 'W', 'T', 'F'],
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await (supabase.from('commute_profiles') as any)
      .upsert(dbPayload, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[Commute Service] Supabase upsert error:', error)
    }

    return {
      userId: user.id,
      origin: input.origin,
      destination: input.destination,
      departureTime: input.departureTime || '08:30 AM',
      returnTime: input.returnTime || '05:30 PM',
      pickupPreference: input.pickupPreference || 'Nearby landmark',
      commuteRole: input.commuteRole || 'passenger',
      scheduleDays: input.scheduleDays || ['M', 'T', 'W', 'T', 'F'],
    }
  } catch (err) {
    return {
      userId: user.id,
      origin: input.origin,
      destination: input.destination,
      departureTime: input.departureTime || '08:30 AM',
      returnTime: input.returnTime || '05:30 PM',
      pickupPreference: input.pickupPreference || 'Nearby landmark',
      commuteRole: input.commuteRole || 'passenger',
      scheduleDays: input.scheduleDays || ['M', 'T', 'W', 'T', 'F'],
    }
  }
}
