'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PricingCard } from '../cards/price-card';

function Billing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>(
    'monthly'
  );

  // Define pricing data for both billing periods
  const pricingData = {
    monthly: [
      {
        title: 'Free',
        price: 0,
        description: '$5 to spend in Tonfy Store or on your own Actors',
        features: ['$0.4 per compute unit', 'Community support'],
        buttonText: 'Start for free',
        buttonVariant: 'outline' as const,
        href: '/signup',
        note: 'No credit card required.',
      },
      {
        title: 'Starter',
        price: 39,
        description: '$39 to spend in Tonfy Store or on your own Actors',
        features: ['$0.4 per compute unit', 'Chat'],
        buttonText: 'Choose plan',
        buttonVariant: 'outline' as const,
        href: '/signup',
      },
      {
        title: 'Scale',
        price: 199,
        description: '$199 to spend in Tonfy Store or on your own Actors',
        features: ['$0.3 per compute unit', 'Priority chat'],
        buttonText: 'Choose plan',
        buttonVariant: 'default' as const,
        popular: true,
        href: '/signup',
      },
      {
        title: 'Business',
        price: 999,
        description: '$999 to spend in Tonfy Store or on your own Actors',
        features: ['$0.25 per compute unit', 'Account manager'],
        buttonText: 'Choose plan',
        buttonVariant: 'outline' as const,
        href: '/signup',
      },
    ],
    annually: [
      {
        title: 'Free',
        price: 0,
        description: '$5 to spend in Tonfy Store or on your own Actors',
        features: ['$0.4 per compute unit', 'Community support'],
        buttonText: 'Start for free',
        buttonVariant: 'outline' as const,
        note: 'No credit card required.',
        href: '/signup',
      },
      {
        title: 'Starter',
        price: 35, // 10% discount applied
        description: '$35 to spend in Tonfy Store or on your own Actors',
        features: ['$0.36 per compute unit', 'Chat'],
        buttonText: 'Choose plan',
        buttonVariant: 'outline' as const,
        href: '/signup',
      },
      {
        title: 'Scale',
        price: 179, // 10% discount applied
        description: '$179 to spend in Tonfy Store or on your own Actors',
        features: ['$0.27 per compute unit', 'Priority chat'],
        buttonText: 'Choose plan',
        buttonVariant: 'default' as const,
        popular: true,
        href: '/signup',
      },
      {
        title: 'Business',
        price: 899, // 10% discount applied
        description: '$899 to spend in Tonfy Store or on your own Actors',
        features: ['$0.225 per compute unit', 'Account manager'],
        buttonText: 'Choose plan',
        buttonVariant: 'outline' as const,
        href: '/signup',
      },
    ],
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-4 pb-8">
        <Button
          variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
          className="rounded-full px-4"
          onClick={() => setBillingPeriod('monthly')}
        >
          Bill monthly
        </Button>
        <Button
          variant={billingPeriod === 'annually' ? 'default' : 'outline'}
          className={`rounded-full px-4 ${
            billingPeriod === 'annually' ? 'bg-accent' : ''
          }`}
          onClick={() => setBillingPeriod('annually')}
        >
          Bill annually <Badge className="ml-2 bg-primary">-10%</Badge>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingData[billingPeriod].map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            buttonText={plan.buttonText}
            buttonVariant={plan.buttonVariant}
            popular={plan.popular}
            href={plan.href}
            note={plan.note}
          />
        ))}
      </div>
    </div>
  );
}

export default Billing;
