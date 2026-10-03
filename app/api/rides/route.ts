import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { createRide } from '@/lib/rides/service'
import { validateCreateRideInput } from '@/lib/rides/validation'
import { getVehicles } from '@/lib/vehicles/service'

export async function POST(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    // Authorization: Only drivers and admins can offer/create rides
    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Only drivers can create rides' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Retrieve driver vehicles to validate vehicle ownership and capacity
    const driverVehicles = await getVehicles(user)
    const selectedVehicle = driverVehicles.find((v: any) => v.id === body.vehicleId) || driverVehicles[0]

    const vehicleCapacity = selectedVehicle?.totalSeats || 6
    const vehicleId = selectedVehicle?.id || body.vehicleId || 'veh-demo-001'

    const validation = validateCreateRideInput({ ...body, vehicleId }, vehicleCapacity)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid ride parameters' },
        { status: 400 }
      )
    }

    const ride = await createRide(user, validation.data)

    return NextResponse.json(
      { success: true, data: ride },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}
