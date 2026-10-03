import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { findMatchingRides } from '@/lib/matching/service'

export async function GET(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)

    const result = await findMatchingRides(user)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to find matching rides' },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process ride matching' },
      { status: 500 }
    )
  }
}
