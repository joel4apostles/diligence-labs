import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCreditBalance, getSubscriptionUsageReport } from "@/lib/subscription-credits"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [creditBalance, usageReport] = await Promise.all([
      getCreditBalance(session.user.id),
      getSubscriptionUsageReport(session.user.id)
    ])

    return NextResponse.json({
      creditBalance,
      usageReport
    })

  } catch (error) {
    console.error("Failed to fetch subscription usage:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription usage" },
      { status: 500 }
    )
  }
}