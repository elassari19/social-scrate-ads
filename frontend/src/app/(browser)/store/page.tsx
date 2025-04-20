import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchInput from '@/components/ui/search-input';
import { developerTools, mockActors, storeCategories } from '@/utils/constants';
import HeroSection from '@/components/sections/hero-section';
import Image from 'next/image';
import customScrapersImage from '@/assets/custom_scrapers.webp';
import { ArrowRight } from 'lucide-react';

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
          <Button variant="outline" key={index}>
            <Link
              href={`/store/categories/${tab.url}`}
              className="cursor-pointer hover:bg-accent w-full h-full text-sm"
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

      {/* Custom Web Scrapers CTA Section */}
      <div className="bg-gradient-to-r from-orange-200 to-orange-50 rounded-xl shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              Do you need custom web scrapers?
            </h2>
            <p className="text-base text-gray-600 max-w-2xl">
              Apify's expert consultants and developers guarantee data quality
              and availability. Leave the management of your web data pipeline
              to us, and focus on your company's business outcomes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                asChild
              >
                <Link href="/services/custom-development">Learn more</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                asChild
              >
                <Link href="/contact-sales">Contact sales</Link>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 relative">
            <div className="">
              <Image
                src={customScrapersImage}
                alt="custom_scrapers"
                width={250}
                height={250}
                className="block w-[30rem]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Developer Tools Section */}
      <div>
        <HeroSection
          heroHeader={
            <>
              <div>
                <h2 className="text-2xl font-bold">Developer tools</h2>
                <p className="text-base">
                  General-purpose Actors to help you build a custom web scraping
                  solution.
                </p>
              </div>
              <Link
                href={'/store/developer-tools'}
                className="cursor-pointer hover:font-semibold whitespace-nowrap"
              >
                View all
                <span className="ml-1">→</span>
              </Link>
            </>
          }
          actors={developerTools}
        />
      </div>

      {/* Popular Tools Section */}
      <div>
        <HeroSection
          heroHeader={
            <>
              <div>
                <h2 className="text-2xl font-bold">
                  Popular Actors from the community
                </h2>
                <p className="text-base">
                  Best picks from developers in our vibrant community.
                </p>
              </div>
              <Link
                href={'/store/developer-tools'}
                className="cursor-pointer hover:font-semibold whitespace-nowrap"
              >
                View all
                <span className="ml-1">→</span>
              </Link>
            </>
          }
          actors={developerTools}
        />
      </div>

      {/* Get Started Now Section */}
      <div className="py-24 md:py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">Get started now</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Step up your web scraping and automation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-6 rounded-full text-lg transition-all"
            asChild
          >
            <Link href="/sign-up">
              Sign up for free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 px-8 py-6 rounded-full text-lg"
            asChild
          >
            <Link href="/build">Build your own Actor</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
