'use client';

import ActorCard from '@/components/cards/actor-card';
import LoadMore from '@/components/sections/load-more';

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
  tags: string[];
}

interface ActorGridProps {
  initialActors: Actor[];
  category?: string;
  searchQuery?: string;
}

export default function ActorGrid({
  initialActors,
  category,
  searchQuery,
}: ActorGridProps) {
  const fetchMoreActors = async (page: number) => {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
      if (searchQuery) queryParams.append('q', searchQuery);
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', '15');

      const response = await fetch(`/api/actors?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch more actors');
      }

      const data = await response.json();
      return data.data;
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
      initialData={initialActors}
      fetchMoreData={fetchMoreActors}
      renderItem={renderActor}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      emptyMessage="No actors found matching your criteria."
      noMoreMessage="No more actors to load"
    />
  );
}
