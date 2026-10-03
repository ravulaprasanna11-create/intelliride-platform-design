import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getProfile, updateProfile } from '@/lib/profile/service'
import { validateUpdateProfileInput } from '@/lib/profile/validation'

export async function GET(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)
    const profile = await getProfile(user)

    return NextResponse.json({
      success: true,
      data: profile,
    })
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
    const body = await req.json()

    const validation = validateUpdateProfileInput(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid request data' },
        { status: 400 }
      )
    }

    const updated = await updateProfile(user, validation.data)

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
