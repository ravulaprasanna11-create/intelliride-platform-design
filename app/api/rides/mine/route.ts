import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getDriverRides } from '@/lib/rides/service'

export async function GET(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Employee role cannot query driver rides' },
        { status: 403 }
      )
    }

    const rides = await getDriverRides(user)

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
