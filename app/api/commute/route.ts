import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoUser } from '@/lib/demo/users'
import { getCommuteProfile, saveCommuteProfile } from '@/lib/commute/service'
import { validateCommuteInput } from '@/lib/commute/validation'

export async function GET(req: NextRequest) {
  try {
    const user = resolveDemoUser(req)
    const commuteProfile = await getCommuteProfile(user)

    return NextResponse.json({
      success: true,
      data: commuteProfile,
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
    const body = await req.json()

    const validation = validateCommuteInput(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid request data' },
        { status: 400 }
      )
    }

    const saved = await saveCommuteProfile(user, validation.data)

    return NextResponse.json(
      { success: true, data: saved },
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
    const body = await req.json()

    const validation = validateCommuteInput(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid request data' },
        { status: 400 }
      )
    }

    const saved = await saveCommuteProfile(user, validation.data)

    return NextResponse.json({
      success: true,
      data: saved,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unable to process request' },
      { status: 500 }
    )
  }
}
