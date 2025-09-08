import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'stripe-shadcn-integration',
  name: 'Stripe Shadcn Integration',
  description: 'Complete Shadcn/ui integration for Stripe',
  version: '1.0.0',
  actions: [
    // Payment Form Component
    {
      type: 'CREATE_FILE',
      path: 'src/components/stripe/payment-form.tsx',
      content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ amount, currency = 'usd', onSuccess, onError }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            cardholder_name: cardDetails.name
          }
        })
      });

      const { client_secret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate a successful payment
      toast({
        title: 'Payment successful!',
        description: 'Your payment has been processed.',
      });

      onSuccess?.(client_secret);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Enter your payment information to complete the purchase of \${amount.toFixed(2)} \${currency.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number">Card Number</Label>
            <Input
              id="number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="text"
                placeholder="123"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : \`Pay \${amount.toFixed(2)} \${currency.toUpperCase()}\`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
`,
      condition: '{{#if integration.features.paymentForms}}'
    },

    // Subscription Card Component
    {
      type: 'CREATE_FILE',
      path: 'src/components/stripe/subscription-card.tsx',
      content: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, DollarSign } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel?: (subscriptionId: string) => void;
  onUpdate?: (subscriptionId: string) => void;
}

export function SubscriptionCard({ subscription, onCancel, onUpdate }: SubscriptionCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const price = subscription.items.data[0]?.price;
  const amount = price?.unit_amount || 0;
  const currency = price?.currency || 'usd';
  const interval = price?.recurring?.interval || 'month';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>
          {formatAmount(amount, currency)} per {interval}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Started: {formatDate(subscription.current_period_start)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Renews: {formatDate(subscription.current_period_end)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Next billing: {formatAmount(amount, currency)} on {formatDate(subscription.current_period_end)}
          </span>
        </div>
        
        <div className="flex gap-2">
          {onUpdate && (
            <Button variant="outline" size="sm" onClick={() => onUpdate(subscription.id)}>
              Update Plan
            </Button>
          )}
          {onCancel && subscription.status === 'active' && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(subscription.id)}>
              Cancel Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
`,
      condition: '{{#if integration.features.subscriptionCards}}'
    },

    // Invoice Table Component
    {
      type: 'CREATE_FILE',
      path: 'src/components/stripe/invoice-table.tsx',
      content: `'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

interface InvoiceTableProps {
  customerId?: string;
  invoices?: Invoice[];
}

export function InvoiceTable({ customerId, invoices: initialInvoices }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [loading, setLoading] = useState(!initialInvoices);

  useEffect(() => {
    if (customerId && !initialInvoices) {
      fetchInvoices();
    }
  }, [customerId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`/api/stripe/invoices?customerId=\${customerId}\`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'void': return 'bg-gray-100 text-gray-800';
      case 'uncollectible': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Loading invoices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>{formatDate(invoice.created)}</TableCell>
                <TableCell>{formatAmount(invoice.amount_paid || invoice.amount_due, invoice.currency)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {invoice.hosted_invoice_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                    )}
                    {invoice.invoice_pdf && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
`,
      condition: '{{#if integration.features.invoiceTables}}'
    },

    // Payment Button Component
    {
      type: 'CREATE_FILE',
      path: 'src/components/stripe/payment-button.tsx',
      content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  priceId?: string;
  mode?: 'payment' | 'subscription';
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PaymentButton({
  amount,
  currency = 'usd',
  priceId,
  mode = 'payment',
  onSuccess,
  onError,
  children,
  className,
  variant = 'default',
  size = 'default'
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (!priceId) {
      onError?.('Price ID is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/cancel'
        })
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        onSuccess?.(sessionId);
        toast({
          title: 'Payment initiated',
          description: 'Redirecting to payment...',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={className}
      variant={variant}
      size={size}
    >
      {loading ? 'Processing...' : children || \`Pay \${amount.toFixed(2)} \${currency.toUpperCase()}\`}
    </Button>
  );
}
`,
      condition: '{{#if integration.features.paymentButtons}}'
    },

    // Pricing Card Component
    {
      type: 'CREATE_FILE',
      path: 'src/components/stripe/pricing-card.tsx',
      content: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { PaymentButton } from './payment-button';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  currency?: string;
  interval?: string;
  priceId?: string;
  features: PricingFeature[];
  popular?: boolean;
  onSelect?: (priceId: string) => void;
}

export function PricingCard({
  name,
  description,
  price,
  currency = 'usd',
  interval = 'month',
  priceId,
  features,
  popular = false,
  onSelect
}: PricingCardProps) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  return (
    <Card className={\`relative w-full \${popular ? 'border-primary shadow-lg' : ''}\`}>
      {popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {formatPrice(price, currency)}
          </span>
          <span className="text-muted-foreground">/{interval}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className={\`text-sm \${feature.included ? 'text-foreground' : 'text-muted-foreground'}\`}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        
        {priceId && (
          <div className="pt-4">
            {onSelect ? (
              <Button 
                className="w-full" 
                variant={popular ? 'default' : 'outline'}
                onClick={() => onSelect(priceId)}
              >
                Select Plan
              </Button>
            ) : (
              <PaymentButton
                amount={price}
                currency={currency}
                priceId={priceId}
                mode="subscription"
                className="w-full"
                variant={popular ? 'default' : 'outline'}
              >
                Select Plan
              </PaymentButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
`,
      condition: '{{#if integration.features.pricingCards}}'
    }
  ]
};
