'use client';

import ActorCard from '@/components/cards/actor-card';
import LoadMore from '@/components/sections/load-more';
import { getActors } from '@/lib/actor';
import { Actor } from '@/types';

interface ActorGridProps {
  category?: string;
  searchQuery?: string;
}

export default function ActorGrid({ category, searchQuery }: ActorGridProps) {
  const fetchMoreActors = async (page: number) => {
    try {
      // Use the server action from actor.ts instead of direct fetch
      const result = await getActors({
        category: category,
        search: searchQuery,
        page: page,
        limit: 15,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch more actors');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading more actors:', error);
      return [];
    }
  };

  const renderActor = (actor: Actor, index: number) => (
    <ActorCard key={actor.id || index} actor={actor} />
  );

  return (
    <LoadMore
      fetchMoreData={fetchMoreActors}
      renderItem={renderActor}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      emptyMessage="No actors found matching your criteria."
      noMoreMessage="No more actors to load"
    />
  );
}
