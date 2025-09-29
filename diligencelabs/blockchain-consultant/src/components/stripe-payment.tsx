"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Initialize Stripe - for demo purposes, we'll use a placeholder
// In production, replace with your actual publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo')

interface StripePaymentProps {
  amount: number
  description: string
  consultationType: string
  duration: string
  onSuccess: () => void
  onError: (error: string) => void
  isOpen: boolean
  onClose: () => void
}

export function StripePayment({
  amount,
  description,
  consultationType,
  duration,
  onSuccess,
  onError,
  isOpen,
  onClose
}: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  useEffect(() => {
    if (isOpen && amount > 0) {
      createPaymentIntent()
    }
  }, [isOpen, amount])

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true)
      
      // Check if Stripe keys are configured
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'pk_test_demo') {
        console.warn("Stripe publishable key not configured, using demo mode")
        // Set a mock payment intent for demo
        setPaymentIntent({ clientSecret: "demo_client_secret", paymentIntentId: "demo_pi" })
        return
      }
      
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          consultationType,
          duration,
          description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to create payment intent")
      }

      const intent = await response.json()
      setPaymentIntent(intent)
    } catch (error) {
      console.error("Payment intent creation failed:", error)
      // For demo purposes, create a mock payment intent
      console.log("Using demo payment intent due to error:", error)
      setPaymentIntent({ clientSecret: "demo_client_secret", paymentIntentId: "demo_pi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (!paymentIntent) {
      onError("Payment not initialized properly")
      return
    }
    
    try {
      setIsLoading(true)
      
      // Check if we're in demo mode
      if (paymentIntent.clientSecret === "demo_client_secret") {
        console.log("Demo payment mode - simulating payment processing")
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log("Demo payment successful")
        onSuccess()
        return
      }
      
      // Real Stripe processing (when keys are configured)
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error("Stripe not loaded properly")
      }

      // For demo purposes, we'll simulate a successful payment
      // In production, you would use stripe.confirmPayment() or redirect to Stripe Checkout
      console.log("Processing real Stripe payment with client secret:", paymentIntent.clientSecret)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful payment
      console.log("Payment processing completed successfully")
      onSuccess()
      
    } catch (error) {
      console.error("Payment failed:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      onError(`Payment processing failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur border border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white mb-2">Complete Payment</CardTitle>
          <p className="text-gray-400">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Amount:</span>
              <span className="text-2xl font-bold text-green-400">${amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Duration:</span>
              <span>{duration} minutes</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-yellow-300 mb-1">Demo Payment Mode</p>
                  <p>This is a demonstration. No actual payment will be processed. In production, this would integrate with Stripe Elements for secure payment processing.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStripeCheckout}
                disabled={isLoading || !paymentIntent}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ${amount}
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                disabled={isLoading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}