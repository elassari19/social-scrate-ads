import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchInput from '@/components/ui/search-input';
import { mockActors, storeCategories } from '@/utils/constants';
import HeroSection from '@/components/sections/hero-section';

export default function StorePage() {
  return (
    <div className="container mx-auto py-20 md:pt-32 px-4">
      {/* Main heading */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
        Apify Store
      </h1>

      {/* Search bar */}
      <SearchInput path="/store/categories" placeholder="Search for Actors" />

      {/* Horizontal filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 md:px-16">
        {storeCategories.map((tab, index) => (
          <Button variant="outline">
            <Link
              href={`/store/categories/${tab.url}`}
              className="cursor-pointer hover:bg-accent w-full h-full text-sm"
              key={index}
            >
              {tab.name}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <HeroSection
          heroHeader={
            <>
              <div>
                <h2 className="text-xl font-bold">All Actors</h2>
                <p className="text-base">
                  Explore 4,000+ pre-built Actors for your web scraping and
                  automation projects.
                </p>
              </div>
              <Link
                href={'/store/actors'}
                className="cursor-pointer hover:font-semibold"
              >
                View all
                <span className="ml-1">→</span>
              </Link>
            </>
          }
          actors={mockActors}
        />
      </div>
    </div>
  );
}
