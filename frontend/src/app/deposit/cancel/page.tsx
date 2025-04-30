'use client';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DepositCancelPage() {
  const router = useRouter();

  return (
    <div className="container max-w-md mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
      <XCircle className="w-16 h-16 text-orange-500 mb-4" />
      <h1 className="text-2xl font-bold mb-4">Deposit Cancelled</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Your deposit has been cancelled. No charges have been made to your
        payment method.
      </p>
      <div className="space-y-4">
        <Button
          onClick={() => router.push('/profile')}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Return to Profile
        </Button>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
