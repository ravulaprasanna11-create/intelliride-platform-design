import { NextRequest, NextResponse } from 'next/server'
import { calculateRouteAsync } from '@/lib/maps/service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const pickup = searchParams.get('pickup') || undefined

    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, error: 'Origin and destination parameters are required' },
        { status: 400 }
      )
    }

    const result = await calculateRouteAsync(origin, destination, pickup)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to calculate map route' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination, pickupLocation } = body

    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, error: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    const result = await calculateRouteAsync(origin, destination, pickupLocation)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to calculate map route' },
      { status: 500 }
    )
  }
}
