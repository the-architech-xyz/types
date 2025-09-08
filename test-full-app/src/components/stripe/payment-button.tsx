'use client';

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
      {loading ? 'Processing...' : children || `Pay ${amount.toFixed(2)} ${currency.toUpperCase()}`}
    </Button>
  );
}
