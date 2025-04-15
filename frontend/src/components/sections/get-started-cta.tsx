import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GetStartedCtaProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  className?: string;
}

export default function GetStartedCta({
  title = 'You’re in the right place, sign up and get started.',
  subtitle = '',
  primaryButtonText = 'Sign up for free',
  primaryButtonHref = '/signup',
  secondaryButtonText = 'Build your own Actor',
  secondaryButtonHref = '/build',
  className = '',
}: GetStartedCtaProps) {
  return (
    <section
      className={`w-full py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <h2 className="max-w-lg mx-auto text-4xl md:text-5xl font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10">
          {subtitle}
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href={primaryButtonHref}>
            <Button
              size="lg"
              className="cursor-pointer rounded-3xl px-6 h-12 text-base font-medium"
            >
              {primaryButtonText} <span className="ml-2">→</span>
            </Button>
          </Link>
          <Link href={secondaryButtonHref}>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer rounded-3xl px-6 h-12 text-base font-medium border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {secondaryButtonText} <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
