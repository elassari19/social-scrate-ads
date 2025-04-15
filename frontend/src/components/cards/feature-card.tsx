import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

interface FeatureCardProps {
  image?: StaticImageData;
  imageAlt?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  ctaVariant?: 'default' | 'outline' | 'link';
  className?: string;
}

export default function FeatureCard({
  image,
  imageAlt = '',
  title,
  description,
  ctaText,
  ctaHref = '#',
  ctaVariant = 'default',
  className = '',
}: FeatureCardProps) {
  return (
    <Link
      href={ctaHref}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex flex-col">
        {image && (
          <div className="mb-4">
            <Image
              src={image}
              alt={imageAlt || title}
              className="w-full mb-2"
              width={500}
              height={40}
            />
          </div>
        )}

        <div className="px-6 pb-2 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 flex-grow">{description}</p>
          <div className="flex justify-end mt-auto">
            <Button variant={ctaVariant} asChild>
              <a href={ctaHref}>
                {ctaText} <span className="ml-1">→</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
