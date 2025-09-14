import { NextRequest, NextResponse } from 'next/server'
import { validatePasswordStrength, getPasswordRequirementsList } from '@/lib/password-security'

export async function POST(request: NextRequest) {
  try {
    const { password, email } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const passwordStrength = validatePasswordStrength(password, email)
    const requirements = getPasswordRequirementsList()

    return NextResponse.json({
      strength: passwordStrength,
      requirements
    })

  } catch (error) {
    console.error('Password strength check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}