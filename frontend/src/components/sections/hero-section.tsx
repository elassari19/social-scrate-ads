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
  actors: Actor[];
  buildActor: Actor;
}

export default function HeroSection({ actors, buildActor }: HeroSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Your full-stack platform for web scraping
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Tonfy is the largest ecosystem where developers build, deploy, and
          publish web scrapers, AI agents, and automation tools. We call them
          Actors.
        </p>
      </div>

      {/* Find platform */}
      <SearchInput />

      {/* Actor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actors.map((actor) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
        <ActorCard
          actor={buildActor}
          className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-blue-50"
        />
      </div>

      {/* Browse More Link */}
      <div className="mt-10 text-center">
        <Link
          href="/actors"
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
        >
          <span>Browse More Actors</span>
          <span className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
}
