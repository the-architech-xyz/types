import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100
    });

    return NextResponse.json({ invoices: invoices.data });
  } catch (error) {
    console.error('Invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, amount, currency = 'usd', description } = await request.json();
    
    if (!customerId || !amount) {
      return NextResponse.json({ error: 'Customer ID and amount are required' }, { status: 400 });
    }

    const invoice = await stripe.invoices.create({
      customer: customerId,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || 'Invoice'
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    return NextResponse.json({ invoice: finalizedInvoice });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
