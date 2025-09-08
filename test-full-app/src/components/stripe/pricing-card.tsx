'use client';

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
    <Card className={`relative w-full ${popular ? 'border-primary shadow-lg' : ''}`}>
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
              <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
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
