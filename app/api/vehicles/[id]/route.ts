import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { deleteVehicle } from '@/lib/vehicles/service'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = resolveDemoUser(req)

    if (user.role === 'employee') {
      return NextResponse.json(
        { success: false, error: 'Employee role cannot manage driver vehicles' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const vehicleId = resolvedParams.id

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    await deleteVehicle(user, vehicleId)

    return NextResponse.json({
      success: true,
      data: { message: 'Vehicle deleted successfully' },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}
