import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

let stripe: Stripe | null = null
if (stripeSecretKey && stripeSecretKey !== 'sk_test_your_stripe_secret_key_here') {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, consultationType, duration, description } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // If Stripe is not configured, return demo response
    if (!stripe) {
      console.warn("Stripe not configured, returning demo payment intent")
      return NextResponse.json({
        clientSecret: "demo_client_secret",
        paymentIntentId: "demo_pi_12345",
        demo: true
      })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: "usd",
      description: description || `Blockchain Consultation - ${consultationType}`,
      metadata: {
        consultationType,
        duration: duration.toString(),
        service: "blockchain_consultation",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}