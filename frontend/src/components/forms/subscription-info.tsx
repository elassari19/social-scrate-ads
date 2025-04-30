'use client';

import React, { useState } from 'react';
import { CreditCard, Star, BarChart, Wallet, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionInfoProps {
  subscription: {
    plan: string;
    status: string;
    requestLimit: number;
    requestCount: number;
    endDate: string;
    balance: number;
  } | null;
}

export default function SubscriptionInfo({
  subscription,
}: SubscriptionInfoProps) {
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    if (depositAmount < 5) {
      setError('Minimum deposit amount is $5');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const response = await fetch(
        '/api/subscription/deposit/checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: depositAmount }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating deposit session:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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

        {/* Account Balance Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <Wallet className="w-4 h-4 mr-1" />
              Account Balance
            </h3>
            <span className="text-sm font-semibold">
              ${subscription.balance.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Your account balance is used for premium features and services
          </p>
          <Button
            onClick={() => setIsDepositDialogOpen(true)}
            size="sm"
            variant="outline"
            className="flex items-center text-xs"
          >
            <PlusCircle className="w-3 h-3 mr-1" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Your Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Minimum deposit amount is $5. Your funds will be available
              immediately after payment.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount">Amount (USD)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="5"
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDepositDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isProcessing || depositAmount < 5}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
