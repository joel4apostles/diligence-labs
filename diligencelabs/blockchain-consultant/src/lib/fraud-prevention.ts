import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

export interface ClientInfo {
  ipAddress: string
  userAgent: string
  fingerprint: string
}

export async function getClientInfo(): Promise<ClientInfo> {
  const headersList = await headers()
  
  // Get IP address (handle various proxy headers)
  const ipAddress = 
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-client-ip") ||
    "unknown"

  const userAgent = headersList.get("user-agent") || "unknown"
  
  // Create a simple fingerprint from available data
  const fingerprint = Buffer.from(`${ipAddress}-${userAgent}`).toString("base64")
  
  return {
    ipAddress: ipAddress.trim(),
    userAgent,
    fingerprint
  }
}

export async function checkFreeConsultationEligibility(
  email: string,
  clientInfo: ClientInfo
): Promise<{
  eligible: boolean
  reason?: string
  userId?: string
}> {
  try {
    // Check if user exists and has already used free consultation
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        createdAt: true
        // Note: freeConsultationUsed and freeConsultationDate might not exist in current DB
        // Let's use a safer approach for now
      }
    })

    // For now, skip the freeConsultationUsed check since the field might not exist in the DB
    // TODO: Add back once database schema is properly synced
    // if (existingUser && existingUser.freeConsultationUsed) {
    //   return {
    //     eligible: false,
    //     reason: "You have already used your free consultation. Please book a paid consultation.",
    //     userId: existingUser.id
    //   }
    // }

    // Check for existing free consultations with same email (guest bookings)
    const existingGuestConsultation = await prisma.session.findFirst({
      where: {
        guestEmail: email,
        isFreeConsultation: true
      }
    })

    if (existingGuestConsultation) {
      return {
        eligible: false,
        reason: "A free consultation has already been booked with this email address."
      }
    }

    // Check for IP address abuse (multiple free consultations from same IP in last 30 days)
    const recentFreeConsultationsFromIP = await prisma.session.findMany({
      where: {
        clientIpAddress: clientInfo.ipAddress,
        isFreeConsultation: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      }
    })

    if (recentFreeConsultationsFromIP.length >= 2) {
      return {
        eligible: false,
        reason: "Multiple free consultations have been detected from this location. Please contact support."
      }
    }

    // Check for fingerprint abuse (same device/browser attempting multiple free consultations)
    const recentFreeConsultationsFromFingerprint = await prisma.session.findMany({
      where: {
        clientFingerprint: clientInfo.fingerprint,
        isFreeConsultation: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      }
    })

    if (recentFreeConsultationsFromFingerprint.length >= 1) {
      return {
        eligible: false,
        reason: "A free consultation has already been booked from this device. Please use a different email or contact support."
      }
    }

    return {
      eligible: true,
      userId: existingUser?.id
    }

  } catch (error) {
    console.error("Error checking free consultation eligibility:", error)
    return {
      eligible: false,
      reason: "Unable to verify eligibility. Please try again later."
    }
  }
}

export async function markFreeConsultationUsed(userId: string): Promise<void> {
  try {
    // For now, skip updating freeConsultationUsed fields until DB schema is synced
    // TODO: Re-enable once database schema is properly synced
    console.log(`Would mark free consultation as used for user: ${userId}`)
    
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     freeConsultationUsed: true,
    //     freeConsultationDate: new Date()
    //   }
    // })
  } catch (error) {
    console.error("Error marking free consultation as used:", error)
  }
}

export function generateClientFingerprint(req: Request): string {
  // Create a more sophisticated fingerprint in the client
  const userAgent = req.headers.get("user-agent") || ""
  const acceptLanguage = req.headers.get("accept-language") || ""
  const acceptEncoding = req.headers.get("accept-encoding") || ""
  
  const components = [
    userAgent,
    acceptLanguage,
    acceptEncoding
  ].join("|")
  
  return Buffer.from(components).toString("base64")
}