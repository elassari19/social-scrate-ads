import React from 'react';
import Image, { StaticImageData } from 'next/image';

interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorImage: StaticImageData;
  className?: string;
}

export default function TestimonialCard({
  quote,
  authorName,
  authorTitle,
  authorImage,
  className = '',
}: TestimonialCardProps) {
  return (
    <div
      className={`bg-white p-8 rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <p className="italic text-gray-600 mb-6">"{quote}"</p>
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
          <Image
            src={authorImage}
            alt={authorName}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-semibold">{authorName}</p>
          <p className="text-sm text-gray-500">{authorTitle}</p>
        </div>
      </div>
    </div>
  );
}
