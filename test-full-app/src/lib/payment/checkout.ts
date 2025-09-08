import { stripe } from './stripe';

interface CreateCheckoutSessionParams {
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession({
  priceId,
  quantity,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI']
    }
  });

  return session;
}

export async function createSubscriptionCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}: Omit<CreateCheckoutSessionParams, 'quantity'>) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required'
  });

  return session;
}
