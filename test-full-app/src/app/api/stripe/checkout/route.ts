import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/checkout';

export async function POST(request: NextRequest) {
  try {
    const { priceId, quantity = 1, successUrl, cancelUrl } = await request.json();
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const session = await createCheckoutSession({
      priceId,
      quantity,
      successUrl: successUrl || `${request.nextUrl.origin}/success`,
      cancelUrl: cancelUrl || `${request.nextUrl.origin}/cancel`
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
