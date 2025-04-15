import React, { ReactNode } from 'react';

interface PublisherFeatureCardProps {
  icon: ReactNode;
  badgeText: string;
  badgeColor: string;
  iconColor: string;
  description: string;
  className?: string;
}

export default function PublisherFeatureCard({
  icon,
  badgeText,
  badgeColor,
  iconColor,
  description,
  className = '',
}: PublisherFeatureCardProps) {
  return (
    <div
      className={`bg-white p-8 rounded-sm shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100 ${className}`}
    >
      <div className="flex items-center mb-4">
        <div className={`h-6 w-6 ${iconColor} mr-2`}>{icon}</div>
        <span
          className={`inline-flex ${badgeColor} text-sm font-medium px-2.5 py-0.5 rounded-full`}
        >
          {badgeText}
        </span>
      </div>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
}
