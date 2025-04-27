import SearchInput from '@/components/ui/search-input';
import { storeCategories } from '@/utils/constants';
import ActorCard from '@/components/cards/actor-card';
import Link from 'next/link';
import { getActors } from '@/lib/actor';

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

interface Props {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function ActorsPage({ searchParams }: Props) {
  const { category: categoryFilter, q: searchQuery } = await searchParams;

  const { data: actors } = await getActors({
    category: categoryFilter,
    search: searchQuery,
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Hero section with search */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 py-12 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Discover Actors</h1>
        <p className="text-gray-800 max-w-3xl mx-auto text-center mb-8">
          Find hundreds of ready-made Actors for your web scraping or automation
          project. Or{' '}
          <Link href="/build">
            <span className="hover:underline text-orange-500 font-semibold">
              build your own
            </span>{' '}
            .
          </Link>
        </p>
        <SearchInput
          path="/store/actors"
          placeholder="Search for actors, e.g., Google Maps Scraper"
        />
      </div>

      {/* Categories */}
      <div className="mb-8 max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/store/actors"
            className={`px-4 py-2 rounded-full text-sm ${
              !categoryFilter
                ? 'bg-black text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          {storeCategories.map((category) => (
            <Link
              key={category.url}
              href={`/store/actors?category=${category.url}${
                searchQuery ? `&q=${searchQuery}` : ''
              }`}
              className={`px-4 py-2 rounded-full text-sm ${
                categoryFilter === category.url
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Actors grid */}
      {actors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">
            No actors found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {actors.map((actor: Actor) => (
            <ActorCard key={actor.id} actor={actor} />
          ))}
        </div>
      )}
    </div>
  );
}
