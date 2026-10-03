import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getVehicles, createVehicle, updateVehicle } from '@/lib/vehicles/service'
import { validateVehicleInput } from '@/lib/vehicles/validation'

export async function GET(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    // Role check: Only driver or admin can view vehicles
    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Employee role cannot manage driver vehicles' },
        { status: 403 }
      )
    }

    const vehicles = await getVehicles(user)

    return NextResponse.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    // Role check: Only driver or admin can create driver vehicles
    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Employee role cannot manage driver vehicles' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = validateVehicleInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid vehicle payload' },
        { status: 400 }
      )
    }

    const created = await createVehicle(user, validation.data)

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Employee role cannot manage driver vehicles' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const vehicleId = body.id || req.nextUrl.searchParams.get('id')

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID is required for updates' },
        { status: 400 }
      )
    }

    const validation = validateVehicleInput(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid vehicle payload' },
        { status: 400 }
      )
    }

    const updated = await updateVehicle(user, vehicleId, validation.data)

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
