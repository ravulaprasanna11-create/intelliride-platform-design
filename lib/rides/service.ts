import { supabase } from '@/lib/supabase/client'
import { AuthUser } from '@/types/auth'
import { CreateRideInput } from './validation'
import { defaultRides } from './index'

// In-Memory Demo Store
// Used when Supabase is unavailable or when demo user IDs fail FK checks.
// Module-level singleton that persists for the lifetime of the Next.js server process.

interface InMemoryRide {
  id: string
  driver_id: string
  driver_name: string
  vehicle_id: string
  origin: string
  destination: string
  pickup_location: string
  departure_time: string
  eta: string
  total_cost: number
  price_per_passenger: number
  seats_available: number
  status: string
  created_at: string
}

const inMemoryStore: InMemoryRide[] = defaultRides.map((r, i) => ({
  id: r.id,
  driver_id: 'drv-001',
  driver_name: r.driver,
  vehicle_id: `veh-demo-00${i + 1}`,
  origin: r.from,
  destination: r.to,
  pickup_location: r.pickup,
  departure_time: r.time,
  eta: r.arrival,
  total_cost: r.totalEstimatedCost,
  price_per_passenger: r.pricePerPassenger,
  seats_available: r.seats,
  status: 'confirmed',
  created_at: new Date().toISOString(),
}))

function mapDbRow(r: InMemoryRide, driverName?: string) {
  return {
    id: r.id,
    driverId: r.driver_id,
    driverName: driverName || r.driver_name || 'Verified Driver',
    vehicleId: r.vehicle_id,
    origin: r.origin,
    destination: r.destination,
    pickupLocation: r.pickup_location,
    departureTime: r.departure_time,
    eta: r.eta,
    totalCost: r.total_cost,
    pricePerPassenger: r.price_per_passenger,
    seatsAvailable: r.seats_available,
    status: r.status,
    createdAt: r.created_at,
  }
}

export async function createRide(user: AuthUser, input: CreateRideInput) {
  const dbPayload = {
    driver_id: user.id,
    vehicle_id: input.vehicleId,
    origin: input.origin,
    destination: input.destination,
    pickup_location: input.pickupLocation,
    departure_time: input.departureTime,
    eta: input.eta,
    total_cost: input.totalCost,
    price_per_passenger: input.pricePerPassenger,
    seats_available: input.seatsAvailable,
    status: 'confirmed',
  }

  let savedId: string | null = null
  let savedAt: string | null = null

  try {
    const { data, error } = await (supabase.from('rides') as any)
      .insert(dbPayload)
      .select()
      .maybeSingle()

    if (!error && data?.id) {
      savedId = data.id
      savedAt = data.created_at
    } else {
      console.warn('[Ride Service] Supabase insert skipped (using in-memory):', error?.message)
    }
  } catch (e) {
    console.warn('[Ride Service] Supabase insert exception:', e)
  }

  const rideId = savedId || `IR-${Date.now().toString().slice(-4)}`
  const rideAt = savedAt || new Date().toISOString()

  const inMemRide: InMemoryRide = {
    id: rideId,
    driver_id: user.id,
    driver_name: user.name,
    vehicle_id: input.vehicleId,
    origin: input.origin,
    destination: input.destination,
    pickup_location: input.pickupLocation,
    departure_time: input.departureTime,
    eta: input.eta,
    total_cost: input.totalCost,
    price_per_passenger: input.pricePerPassenger,
    seats_available: input.seatsAvailable,
    status: 'confirmed',
    created_at: rideAt,
  }
  inMemoryStore.unshift(inMemRide)

  return {
    id: rideId,
    driverId: user.id,
    driverName: user.name,
    vehicleId: input.vehicleId,
    origin: input.origin,
    destination: input.destination,
    pickupLocation: input.pickupLocation,
    departureTime: input.departureTime,
    eta: input.eta,
    totalCost: input.totalCost,
    pricePerPassenger: input.pricePerPassenger,
    seatsAvailable: input.seatsAvailable,
    status: 'confirmed',
    createdAt: rideAt,
  }
}

export async function getDriverRides(user: AuthUser) {
  try {
    const { data, error } = await (supabase.from('rides') as any)
      .select('*')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((r: any) => mapDbRow(r, user.name))
    }
  } catch {
    // Fall through to in-memory
  }

  return inMemoryStore
    .filter(r => r.driver_id === user.id)
    .map(r => mapDbRow(r, user.name))
}

export async function getAvailableRides() {
  try {
    const { data, error } = await (supabase.from('rides') as any)
      .select('*')
      .eq('status', 'confirmed')
      .gt('seats_available', 0)
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((r: any) => mapDbRow(r, 'Verified Driver'))
    }
  } catch {
    // Fall through to in-memory
  }

  return inMemoryStore
    .filter(r => r.status === 'confirmed' && r.seats_available > 0)
    .map(r => mapDbRow(r, r.driver_name))
}

export async function getRideById(rideId: string) {
  try {
    const { data, error } = await (supabase.from('rides') as any)
      .select('*')
      .eq('id', rideId)
      .maybeSingle()

    if (!error && data) {
      return mapDbRow(data)
    }
  } catch {
    // Fall through to in-memory
  }

  const mem = inMemoryStore.find(r => r.id === rideId)
  return mem ? mapDbRow(mem) : mapDbRow(inMemoryStore[0])
}

export async function updateRide(user: AuthUser, rideId: string, input: CreateRideInput) {
  const dbPayload = {
    vehicle_id: input.vehicleId,
    origin: input.origin,
    destination: input.destination,
    pickup_location: input.pickupLocation,
    departure_time: input.departureTime,
    eta: input.eta,
    total_cost: input.totalCost,
    price_per_passenger: input.pricePerPassenger,
    seats_available: input.seatsAvailable,
  }

  try {
    const { error } = await (supabase.from('rides') as any)
      .update(dbPayload)
      .eq('id', rideId)
      .eq('driver_id', user.id)

    if (error) {
      console.warn('[Ride Service] Supabase update skipped:', error?.message)
    }
  } catch {
    // Fall through
  }

  const idx = inMemoryStore.findIndex(r => r.id === rideId && r.driver_id === user.id)
  if (idx !== -1) {
    inMemoryStore[idx] = {
      ...inMemoryStore[idx],
      vehicle_id: input.vehicleId,
      origin: input.origin,
      destination: input.destination,
      pickup_location: input.pickupLocation,
      departure_time: input.departureTime,
      eta: input.eta,
      total_cost: input.totalCost,
      price_per_passenger: input.pricePerPassenger,
      seats_available: input.seatsAvailable,
    }
  }

  return {
    id: rideId,
    driverId: user.id,
    driverName: user.name,
    vehicleId: input.vehicleId,
    origin: input.origin,
    destination: input.destination,
    pickupLocation: input.pickupLocation,
    departureTime: input.departureTime,
    eta: input.eta,
    totalCost: input.totalCost,
    pricePerPassenger: input.pricePerPassenger,
    seatsAvailable: input.seatsAvailable,
    status: inMemoryStore.find(r => r.id === rideId)?.status || 'confirmed',
  }
}

export async function cancelRide(user: AuthUser, rideId: string) {
  try {
    const { error } = await (supabase.from('rides') as any)
      .update({ status: 'cancelled' })
      .eq('id', rideId)
      .eq('driver_id', user.id)

    if (error) {
      console.warn('[Ride Service] Supabase cancel skipped:', error?.message)
    }
  } catch {
    // Fall through
  }

  const idx = inMemoryStore.findIndex(r => r.id === rideId && r.driver_id === user.id)
  if (idx !== -1) {
    inMemoryStore[idx].status = 'cancelled'
  }

  return { success: true, id: rideId, status: 'cancelled' }
}

// ==========================================
// Phase 7: Ride Request & Member Management
// ==========================================

export interface InMemoryRideRequest {
  id: string
  ride_id: string
  user_id: string
  user_name: string
  user_email: string
  pickup_location: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
}

export interface InMemoryRideMember {
  id: string
  ride_id: string
  user_id: string
  pickup_location: string
  status: string
  created_at: string
}

const inMemoryRequests: InMemoryRideRequest[] = [
  {
    id: 'req-demo-001',
    ride_id: 'IR-1024',
    user_id: 'emp-001',
    user_name: 'Alex Morgan',
    user_email: 'employee@intelliride.demo',
    pickup_location: 'Hitech City Metro',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
]

const inMemoryMembers: InMemoryRideMember[] = []

function formatRequest(r: InMemoryRideRequest) {
  return {
    id: r.id,
    rideId: r.ride_id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    pickupLocation: r.pickup_location,
    status: r.status,
    createdAt: r.created_at,
  }
}

export async function createRideRequest(user: AuthUser, rideId: string, pickupLocation?: string) {
  if (user.role !== 'employee') {
    return { success: false, error: 'Only employees can request to join a ride', statusCode: 403 }
  }

  const ride = await getRideById(rideId)
  if (!ride) {
    return { success: false, error: 'Ride not found', statusCode: 404 }
  }

  if (ride.driverId === user.id) {
    return { success: false, error: 'Driver cannot request their own ride', statusCode: 403 }
  }

  if (ride.status === 'cancelled') {
    return { success: false, error: 'Ride has been cancelled', statusCode: 400 }
  }

  if (ride.seatsAvailable <= 0) {
    return { success: false, error: 'No seats available for this ride', statusCode: 409 }
  }

  const isMemberMem = inMemoryMembers.some(m => m.ride_id === rideId && m.user_id === user.id)
  if (isMemberMem) {
    return { success: false, error: 'You are already a member of this ride', statusCode: 409 }
  }

  const existingReq = inMemoryRequests.find(r => r.ride_id === rideId && r.user_id === user.id && (r.status === 'pending' || r.status === 'accepted'))
  if (existingReq) {
    return { success: false, error: 'You already have an active request for this ride', statusCode: 409 }
  }

  const reqId = `req-${Date.now().toString().slice(-6)}`
  const createdAt = new Date().toISOString()
  const pickup = pickupLocation || ride.pickupLocation || 'Pickup location'

  try {
    const { error } = await (supabase.from('ride_requests') as any).insert({
      id: reqId,
      ride_id: rideId,
      user_id: user.id,
      pickup_location: pickup,
      status: 'pending',
    })
    if (error) {
      console.warn('[Ride Service] Supabase insert ride_request skipped:', error?.message)
    }
  } catch (e) {
    // Fallback to in-memory
  }

  const newReq: InMemoryRideRequest = {
    id: reqId,
    ride_id: rideId,
    user_id: user.id,
    user_name: user.name,
    user_email: user.email || 'employee@intelliride.demo',
    pickup_location: pickup,
    status: 'pending',
    created_at: createdAt,
  }
  inMemoryRequests.unshift(newReq)

  return { success: true, data: formatRequest(newReq), statusCode: 201 }
}

export async function getEmployeeRideRequest(user: AuthUser, rideId: string) {
  try {
    const { data, error } = await (supabase.from('ride_requests') as any)
      .select('*')
      .eq('ride_id', rideId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (!error && data) {
      return {
        success: true,
        data: {
          status: data.status,
          request: {
            id: data.id,
            rideId: data.ride_id,
            userId: data.user_id,
            userName: user.name,
            userEmail: user.email || '',
            pickupLocation: data.pickup_location,
            status: data.status,
            createdAt: data.created_at,
          }
        }
      }
    }
  } catch {
    // Fall through
  }

  const memReq = inMemoryRequests.find(r => r.ride_id === rideId && r.user_id === user.id)
  return {
    success: true,
    data: {
      status: memReq ? memReq.status : 'none',
      request: memReq ? formatRequest(memReq) : null,
    }
  }
}

export async function cancelRideRequest(user: AuthUser, rideId: string) {
  const reqIdx = inMemoryRequests.findIndex(r => r.ride_id === rideId && r.user_id === user.id && r.status === 'pending')

  try {
    const { error } = await (supabase.from('ride_requests') as any)
      .update({ status: 'cancelled' })
      .eq('ride_id', rideId)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (error) {
      console.warn('[Ride Service] Supabase cancel request skipped:', error?.message)
    }
  } catch {
    // Fall through
  }

  if (reqIdx !== -1) {
    inMemoryRequests[reqIdx].status = 'cancelled'
    return { success: true, data: { status: 'cancelled' } }
  }

  return { success: true, data: { status: 'cancelled' } }
}

export async function getRideRequestsForDriver(user: AuthUser, rideId: string) {
  const ride = await getRideById(rideId)
  if (!ride) {
    return { success: false, error: 'Ride not found', statusCode: 404 }
  }

  if (ride.driverId !== user.id) {
    return { success: false, error: 'Only the ride driver can access incoming requests', statusCode: 403 }
  }

  try {
    const { data, error } = await (supabase.from('ride_requests') as any)
      .select('*')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        success: true,
        data: data.map((r: any) => ({
          id: r.id,
          rideId: r.ride_id,
          userId: r.user_id,
          userName: 'Requesting Employee',
          userEmail: 'employee@intelliride.demo',
          pickupLocation: r.pickup_location,
          status: r.status,
          createdAt: r.created_at,
        }))
      }
    }
  } catch {
    // Fall through
  }

  const memReqs = inMemoryRequests.filter(r => r.ride_id === rideId)
  return {
    success: true,
    data: memReqs.map(formatRequest)
  }
}

export async function acceptRideRequest(user: AuthUser, rideId: string, requestId: string) {
  const ride = await getRideById(rideId)
  if (!ride) {
    return { success: false, error: 'Ride not found', statusCode: 404 }
  }

  if (ride.driverId !== user.id) {
    return { success: false, error: 'Only the ride driver can accept requests', statusCode: 403 }
  }

  const memReq = inMemoryRequests.find(r => r.id === requestId && r.ride_id === rideId)
  if (!memReq || memReq.status !== 'pending') {
    return { success: false, error: 'Request is not pending or does not exist', statusCode: 400 }
  }

  const rideIdx = inMemoryStore.findIndex(r => r.id === rideId)
  const availableSeats = rideIdx !== -1 ? inMemoryStore[rideIdx].seats_available : ride.seatsAvailable

  if (availableSeats <= 0) {
    return { success: false, error: 'No seats available', statusCode: 409 }
  }

  memReq.status = 'accepted'

  inMemoryMembers.push({
    id: `mem-${Date.now().toString().slice(-6)}`,
    ride_id: rideId,
    user_id: memReq.user_id,
    pickup_location: memReq.pickup_location,
    status: 'confirmed',
    created_at: new Date().toISOString()
  })

  if (rideIdx !== -1 && inMemoryStore[rideIdx].seats_available > 0) {
    inMemoryStore[rideIdx].seats_available -= 1
  }

  try {
    await (supabase.from('ride_requests') as any)
      .update({ status: 'accepted' })
      .eq('id', requestId)

    await (supabase.from('ride_members') as any).insert({
      ride_id: rideId,
      user_id: memReq.user_id,
      pickup_location: memReq.pickup_location,
      status: 'confirmed',
    })

    await (supabase.from('rides') as any)
      .update({ seats_available: Math.max(0, availableSeats - 1) })
      .eq('id', rideId)
  } catch {
    // Fallback already updated in-memory
  }

  return { success: true, data: formatRequest(memReq) }
}

export async function rejectRideRequest(user: AuthUser, rideId: string, requestId: string) {
  const ride = await getRideById(rideId)
  if (!ride) {
    return { success: false, error: 'Ride not found', statusCode: 404 }
  }

  if (ride.driverId !== user.id) {
    return { success: false, error: 'Only the ride driver can reject requests', statusCode: 403 }
  }

  const memReq = inMemoryRequests.find(r => r.id === requestId && r.ride_id === rideId)
  if (!memReq || memReq.status !== 'pending') {
    return { success: false, error: 'Request is not pending or does not exist', statusCode: 400 }
  }

  memReq.status = 'rejected'

  try {
    await (supabase.from('ride_requests') as any)
      .update({ status: 'rejected' })
      .eq('id', requestId)
  } catch {
    // Fall through
  }

  return { success: true, data: formatRequest(memReq) }
}

