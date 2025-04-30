'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function DepositSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const amount = searchParams.get('amount');
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session');
      setIsProcessing(false);
      return;
    }

    const processDeposit = async () => {
      try {
        const response = await fetch('/api/subscription/deposit/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to process deposit');
        }

        // Wait a bit to show success message
        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
      } catch (err) {
        console.error('Error processing deposit:', err);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
        setIsProcessing(false);
      }
    };

    processDeposit();
  }, [sessionId]);

  return (
    <div className="container max-w-md mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
      {isProcessing ? (
        <>
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold mb-4">Processing Your Deposit</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please wait while we confirm your payment...
          </p>
        </>
      ) : error ? (
        <>
          <div className="text-red-500 mb-4 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <Button
            onClick={() => router.push('/profile')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Return to Profile
          </Button>
        </>
      ) : (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Deposit Successful!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your deposit of ${amount || '—'} has been added to your account
            balance.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You can now use these funds for premium features and services.
          </p>
          <Button
            onClick={() => router.push('/profile')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Return to Profile
          </Button>
        </>
      )}
    </div>
  );
}
