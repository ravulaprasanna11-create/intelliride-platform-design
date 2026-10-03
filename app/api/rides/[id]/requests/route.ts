import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getRideRequestsForDriver } from '@/lib/rides/service'

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

    const res = await getRideRequestsForDriver(user, rideId)

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: res.statusCode || 400 }
      )
    }

    return NextResponse.json(res, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to fetch requests for ride' },
      { status: 500 }
    )
  }
}
