import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { Button } from '@/components/ui/button';
import PublisherFeatureCard from '../cards/publisher-feature-card';

interface PublisherSectionProps {
  publishImage: StaticImageData;
}

export default function PublisherSection({
  publishImage,
}: PublisherSectionProps) {
  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Publish Actors. Get paid.
          </h2>
        </div>

        {/* Stats and Image Display */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-0 md:px-16 border border-gray-200">
          <div className="w-full h-full md:w-1/2 space-y-6  p-4 md:px-16 border-l border-gray-200">
            <h3 className="text-2xl md:text-3xl mb-4">
              Reach thousands of new customers
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Building and running a SaaS is hard. Building an Actor and selling
              it on Tonfy Store is 10x easier. Get visitors from day one.
            </p>
            <Link href="/publish" passHref>
              <div className="inline-block">
                <Button size="lg" className="cursor-pointer">
                  Learn more <span className="ml-1">→</span>
                </Button>
              </div>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <Image
              src={publishImage}
              alt="Publish actors visualization"
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 px-0 md:px-16">
          {/* Card 1 - No upfront costs */}
          <PublisherFeatureCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            badgeText="No upfront costs"
            badgeColor="bg-blue-100 text-blue-800"
            iconColor="text-blue-500"
            description="Publishing your Actor is free of charge—the customers pay for the computing resources. New creators get $500 free platform credits."
          />

          {/* Card 2 - Rely on Tonfy infra */}
          <PublisherFeatureCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            badgeText="Rely on Tonfy infra"
            badgeColor="bg-purple-100 text-purple-800"
            iconColor="text-purple-500"
            description="Actors scale automatically as you gain new users. You don't need to worry about compute, storage, proxies, or authentication."
          />

          {/* Card 3 - Billing is on us */}
          <PublisherFeatureCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            badgeText="Billing is on us"
            badgeColor="bg-green-100 text-green-800"
            iconColor="text-green-500"
            description="Handling payments, taxes, and invoicing is a painful part of running a SaaS. Tonfy does all that and sends you a net payout every month."
          />
        </div>
      </div>
    </section>
  );
}
