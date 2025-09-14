import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const walletSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { walletAddress } = walletSchema.parse(body)

    // Check if wallet is already connected to another account
    const existingWallet = await prisma.user.findFirst({
      where: {
        walletAddress: walletAddress,
        id: { not: session.user.id }
      }
    })

    if (existingWallet) {
      return NextResponse.json(
        { message: "This wallet is already connected to another account" },
        { status: 400 }
      )
    }

    // Update user with wallet address
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        role: true,
      }
    })

    return NextResponse.json({
      message: "Wallet connected successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Wallet sync error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid wallet address", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Remove wallet address from user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: null },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        role: true,
      }
    })

    return NextResponse.json({
      message: "Wallet disconnected successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Wallet disconnect error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}