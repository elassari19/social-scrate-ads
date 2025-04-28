'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="container flex h-screen flex-col items-center justify-center">
          <div className="flex max-w-[600px] flex-col items-center justify-center gap-4 text-center">
            <div className="text-destructive bg-destructive/10 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">
              Something went seriously wrong
            </h1>
            <p className="text-muted-foreground">
              A critical error has occurred. We've been notified and are working
              to fix the issue.
            </p>
            <div className="mt-6 flex gap-4">
              <Button onClick={reset} variant="destructive">
                Try to Recover
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
