import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getRideById, updateRide, cancelRide } from '@/lib/rides/service'
import { validateCreateRideInput } from '@/lib/rides/validation'
import { getVehicles } from '@/lib/vehicles/service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const rideId = resolvedParams.id

    if (!rideId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    const ride = await getRideById(rideId)

    return NextResponse.json({
      success: true,
      data: ride,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = resolveDemoUser(req)

    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Only drivers can update rides' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const rideId = resolvedParams.id
    const body = await req.json()

    const driverVehicles = await getVehicles(user)
    const selectedVehicle = driverVehicles.find((v: any) => v.id === body.vehicleId) || driverVehicles[0]
    const vehicleCapacity = selectedVehicle?.totalSeats || 6
    const vehicleId = selectedVehicle?.id || body.vehicleId || 'veh-demo-001'

    const validation = validateCreateRideInput({ ...body, vehicleId }, vehicleCapacity)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid update parameters' },
        { status: 400 }
      )
    }

    const updated = await updateRide(user, rideId, validation.data)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = resolveDemoUser(req)

    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Only drivers can cancel rides' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const rideId = resolvedParams.id

    if (!rideId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    const res = await cancelRide(user, rideId)

    return NextResponse.json({
      success: true,
      data: res,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}
