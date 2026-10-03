import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { acceptRideRequest } from '@/lib/rides/service'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const user = resolveDemoUser(req)
    const resolvedParams = await params
    const { id: rideId, requestId } = resolvedParams

    if (!rideId || !requestId) {
      return NextResponse.json(
        { success: false, error: 'Ride ID and Request ID are required' },
        { status: 400 }
      )
    }

    const res = await acceptRideRequest(user, rideId, requestId)

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: res.statusCode || 400 }
      )
    }

    return NextResponse.json(res, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to accept ride request' },
      { status: 500 }
    )
  }
}
