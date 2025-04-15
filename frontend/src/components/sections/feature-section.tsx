import React from 'react';
import { StaticImageData } from 'next/image';
import FeatureCard from '../cards/feature-card';

interface FeatureSectionProps {
  scrapeImage: StaticImageData;
  buildActorImage: StaticImageData;
  servicesImage: StaticImageData;
}

export default function FeatureSection({
  scrapeImage,
  buildActorImage,
  servicesImage,
}: FeatureSectionProps) {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Not just a web scraping API
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {/* Left Card - Marketplace */}
          <FeatureCard
            image={scrapeImage}
            imageAlt="Marketplace of scrapers"
            title="Marketplace of scrapers"
            description="Get parsed data instantly with Actors for most popular websites."
            ctaText="Visit Tonfy Store"
            ctaVariant="link"
            ctaHref="/store"
          />

          {/* Middle Card - Platform */}
          <FeatureCard
            image={buildActorImage}
            imageAlt="Platform to build your own"
            title="Platform to build your own"
            description="Tonfy gives you all the tools and docs you need to build reliable scrapers. Fast."
            ctaText="Start building"
            ctaVariant="link"
            ctaHref="/build"
          />

          {/* Right Card - Professional Services */}
          <FeatureCard
            image={servicesImage}
            imageAlt="Professional services"
            title="Professional services"
            description="Rely on our experts to deliver and maintain custom web scraping solutions for you."
            ctaText="Learn more"
            ctaVariant="link"
            ctaHref="/services"
          />
        </div>
      </div>
    </section>
  );
}
