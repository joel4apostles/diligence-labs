import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log('Complete signout API called')
    
    // Get the current session
    const session = await getServerSession(authOptions)
    console.log('Current session before signout:', !!session)
    
    // Create response to clear all auth cookies
    const response = NextResponse.json({ 
      success: true, 
      message: "Completely signed out" 
    })
    
    // Clear all NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.callback-url'
    ]
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0), // Set to epoch time to delete
        path: '/'
      })
    })
    
    console.log('All auth cookies cleared')
    return response
    
  } catch (error) {
    console.error('Complete signout error:', error)
    return NextResponse.json(
      { error: "Failed to sign out completely" },
      { status: 500 }
    )
  }
}