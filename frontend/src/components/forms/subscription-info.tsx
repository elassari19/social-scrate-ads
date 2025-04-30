'use client';

import React from 'react';
import { CreditCard, Star, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionInfoProps {
  subscription: {
    plan: string;
    status: string;
    requestLimit: number;
    requestCount: number;
    endDate: string;
  } | null;
}

export default function SubscriptionInfo({
  subscription,
}: SubscriptionInfoProps) {
  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription
          </h2>
        </div>

        <div className="py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have an active subscription plan.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // Format date
  const endDate = new Date(subscription.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate usage percentage
  const usagePercentage = Math.min(
    Math.round((subscription.requestCount / subscription.requestLimit) * 100),
    100
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Subscription
        </h2>

        <Button variant="outline" className="flex items-center">
          Manage Subscription
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Plan
            </p>
            <p className="text-lg font-semibold flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {subscription.plan} Plan
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Renewal Date
            </p>
            <p className="text-sm font-medium">{endDate}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <BarChart className="w-4 h-4 mr-1" />
              Monthly Usage
            </h3>
            <span className="text-sm">
              {subscription.requestCount} / {subscription.requestLimit} requests
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                usagePercentage > 90
                  ? 'bg-red-500'
                  : usagePercentage > 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {usagePercentage}% of monthly limit used
          </p>
        </div>
      </div>
    </div>
  );
}
