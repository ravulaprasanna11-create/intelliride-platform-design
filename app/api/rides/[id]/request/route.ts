import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import {
  createRideRequest,
  getEmployeeRideRequest,
  cancelRideRequest,
} from '@/lib/rides/service'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = resolveDemoUser(req)
    const resolvedParams = await params
    const rideId = resolvedParams.id

    if (!rideId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    let pickupLocation: string | undefined = undefined
    try {
      const body = await req.json()
      pickupLocation = body?.pickupLocation
    } catch {
      // Body optional
    }

    const res = await createRideRequest(user, rideId, pickupLocation)

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: res.statusCode || 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: res.data },
      { status: res.statusCode || 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process ride request' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = resolveDemoUser(req)
    const resolvedParams = await params
    const rideId = resolvedParams.id

    if (!rideId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    const res = await getEmployeeRideRequest(user, rideId)

    return NextResponse.json(res, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to fetch request status' },
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
    const resolvedParams = await params
    const rideId = resolvedParams.id

    if (!rideId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    const res = await cancelRideRequest(user, rideId)

    return NextResponse.json(res, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to cancel ride request' },
      { status: 500 }
    )
  }
}
