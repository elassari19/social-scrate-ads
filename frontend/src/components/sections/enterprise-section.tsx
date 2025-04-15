import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { Button } from '@/components/ui/button';
import TestimonialCard from '../cards/testimonial-card';

interface EnterpriseSectionProps {
  soc2Image: StaticImageData;
  gdprImage: StaticImageData;
  avatarImage: StaticImageData;
}

export default function EnterpriseSection({
  soc2Image,
  gdprImage,
  avatarImage,
}: EnterpriseSectionProps) {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-grade solution
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            Secure and reliable web data extraction provider for any scale.
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-8">
            <div className="flex items-center">
              <span className="mr-1">99.95% uptime.</span>
            </div>
            <div className="flex items-center">
              <span>SOC2,</span>
            </div>
            <div className="flex items-center">
              <span>GDPR,</span>
            </div>
            <div className="flex items-center">
              <span>and CCPA compliant.</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
            <Image
              src={soc2Image}
              alt="SOC2 Certified"
              width={64}
              height={28}
              className="mr-1"
            />
            <Link href="/contact-sales">
              <Button className="px-6 cursor-pointer" size="lg">
                Contact sales <span className="ml-1">→</span>
              </Button>
            </Link>
            <Link href="/customers">
              <Button
                variant="outline"
                className="px-6 cursor-pointer"
                size="lg"
              >
                Learn more
              </Button>
            </Link>
            <Image
              src={gdprImage}
              alt="GDPR Compliant"
              width={64}
              height={28}
              className="mr-1"
            />
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Testimonial Cards */}
          <TestimonialCard
            quote="We looked at several providers, and Tonfy was the most complete, reliant solution we found. It was miles ahead of everything else we reviewed."
            authorName="Pranav Singh"
            authorTitle="Engineering Manager at Intercom"
            authorImage={avatarImage}
          />

          <TestimonialCard
            quote="We selected Tonfy because of their vast experience with web data collection to empower our sales team with fresh, unique leads."
            authorName="Filip Popovic"
            authorTitle="COO at Groupon"
            authorImage={avatarImage}
          />

          <TestimonialCard
            quote="Our collaboration with Tonfy proves that advanced IT tools leveraging AI can be the key in detecting infringements of consumer protection legislation."
            authorName="Marie-Paule Benassi"
            authorTitle="Consumer Affairs Director at EU"
            authorImage={avatarImage}
          />
        </div>

        {/* Secondary CTA */}
        <div className="flex justify-center mt-8">
          <Link
            href="/customers"
            className="inline-flex items-center text-gray-700 hover:text-gray-900 hover:underline"
          >
            <span>Read more customer stories</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
