import { NextRequest, NextResponse } from 'next/server'
import { getAvailableRides } from '@/lib/rides/service'

export async function GET(req: NextRequest) {
  try {
    const rides = await getAvailableRides()

    return NextResponse.json({
      success: true,
      data: rides,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}
