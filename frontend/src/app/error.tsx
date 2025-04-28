'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <div className="flex max-w-[600px] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. Please try again later or contact
          support if the problem persists.
        </p>
        <div className="mt-6 flex gap-4">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
