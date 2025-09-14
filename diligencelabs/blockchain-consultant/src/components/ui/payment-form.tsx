"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "./button"

interface PaymentFormProps {
  amount: number
  consultationType: string
  duration: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentForm({
  amount,
  consultationType,
  duration,
  onSuccess,
  onError,
  disabled = false
}: PaymentFormProps) {
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    if (!stripePromise) {
      onError("Stripe is not properly configured")
      return
    }

    setProcessing(true)

    try {
      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          consultationType,
          duration,
          description: `Blockchain Consultation - ${consultationType} (${duration} min)`
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { clientSecret } = await response.json()

      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error("Failed to load Stripe")
      }

      // For demo purposes, we'll simulate a successful payment
      // In production, you would redirect to Stripe Checkout or use Elements
      console.log("Payment would be processed with client secret:", clientSecret)
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful payment
      onSuccess()
      
    } catch (error) {
      console.error("Payment error:", error)
      onError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600">
        <h3 className="font-semibold text-white mb-2">Payment Summary</h3>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Service:</span>
          <span className="text-white">{consultationType}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Duration:</span>
          <span className="text-white">{duration} minutes</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold mt-2 pt-2 border-t border-gray-600">
          <span className="text-gray-300">Total:</span>
          <span className="text-green-400">${amount}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={disabled || processing}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 rounded-lg transition-all duration-300"
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${amount} & Book Session`
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Secure payment powered by Stripe. Your payment information is encrypted and secure.
      </p>
    </div>
  )
}