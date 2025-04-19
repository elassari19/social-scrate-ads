import React from 'react';
import Link from 'next/link';
import SearchInput from '../../components/ui/search-input';
import ActorCard from '../../components/cards/actor-card';

interface Actor {
  id: number;
  title: string;
  namespace: string;
  description: string;
  stars: string;
  rating: number;
  authorName: string;
  authorBadgeColor: string;
  icon: string;
  iconBg: string;
}

interface HeroSectionProps {
  heroHeader?: React.ReactNode;
  actors: Actor[];
  buildActor?: Actor;
  heroFooter?: React.ReactNode;
}

export default function HeroSection({
  heroHeader,
  actors,
  buildActor,
  heroFooter,
}: HeroSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 text-center md:text-left">
        {heroHeader}
      </div>

      {/* Actor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actors.map((actor) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
        {buildActor && (
          <ActorCard
            actor={buildActor}
            className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-blue-50"
          />
        )}
      </div>

      {/* Browse More Link */}
      {heroFooter}
    </section>
  );
}
