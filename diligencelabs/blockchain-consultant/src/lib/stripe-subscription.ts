import Stripe from 'stripe'
import { getStripePriceId, getPlanPrice } from './subscription-plans'

// Hardcoded types to match Prisma schema until client generation is fixed
type SubscriptionPlan = 'BASIC_MONTHLY' | 'PROFESSIONAL_MONTHLY' | 'ENTERPRISE_MONTHLY'
type BillingCycle = 'MONTHLY' | 'YEARLY'

// Use dummy Stripe key for builds when actual STRIPE_SECRET_KEY is not available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build_purposes_only'

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'development') {
  console.warn('STRIPE_SECRET_KEY is not defined - using dummy key for build. Stripe functionality will not work until proper key is configured.')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

export interface CreateSubscriptionParams {
  userId: string
  email: string
  planId: SubscriptionPlan
  billingCycle: BillingCycle
  successUrl: string
  cancelUrl: string
}

export interface CreateCustomerParams {
  email: string
  name?: string
  userId: string
}

export async function createStripeCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
    },
  })

  return customer
}

export async function createSubscriptionCheckoutSession(params: CreateSubscriptionParams): Promise<Stripe.Checkout.Session> {
  const priceId = getStripePriceId(params.planId, params.billingCycle)
  
  if (!priceId) {
    throw new Error(`No Stripe price ID found for plan ${params.planId} with billing cycle ${params.billingCycle}`)
  }

  // For development/testing - check if we have placeholder price IDs
  if (priceId.startsWith('price_') && !priceId.startsWith('price_1')) {
    console.warn(`Using placeholder price ID: ${priceId}. Creating test checkout with mock price.`)
    
    // Create a one-time payment for testing instead of subscription
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // Changed to payment mode for testing
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${params.planId} Subscription (Test)`,
              description: 'Test subscription - this would normally be a recurring subscription'
            },
            unit_amount: getPlanPrice(params.planId, params.billingCycle) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        planId: params.planId,
        billingCycle: params.billingCycle,
        testMode: 'true'
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: params.email,
    metadata: {
      userId: params.userId,
      planId: params.planId,
      billingCycle: params.billingCycle,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        planId: params.planId,
        billingCycle: params.billingCycle,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })

  return session
}

export async function cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Stripe.Subscription> {
  if (immediate) {
    return await stripe.subscriptions.cancel(subscriptionId)
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
}

export async function updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

export async function pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: 'mark_uncollectible',
    },
  })
}

export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: null,
  })
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.ApiList<Stripe.Subscription>> {
  return await stripe.subscriptions.list({
    customer: customerId,
  })
}

export async function createUsageRecord(subscriptionItemId: string, quantity: number): Promise<Stripe.UsageRecord> {
  return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: Math.floor(Date.now() / 1000),
  })
}

export async function getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice> {
  return await stripe.invoices.retrieveUpcoming({
    customer: customerId,
  })
}

export async function getInvoices(customerId: string): Promise<Stripe.ApiList<Stripe.Invoice>> {
  return await stripe.invoices.list({
    customer: customerId,
  })
}

export function mapStripeStatusToSubscriptionStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE'
    case 'paused':
      return 'PAUSED'
    case 'canceled':
      return 'CANCELED'
    case 'past_due':
      return 'PAST_DUE'
    case 'incomplete':
    case 'incomplete_expired':
      return 'INCOMPLETE'
    case 'trialing':
      return 'TRIALING'
    default:
      return 'INCOMPLETE'
  }
}

export { stripe }