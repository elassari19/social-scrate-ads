import SearchInput from '@/components/ui/search-input';
import { storeCategories } from '@/utils/constants';
import Link from 'next/link';
import { getActors } from '@/lib/actor';
import ActorGrid from '@/components/sections/actor-grid';

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
          <Link href="/store/actors/build">
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

      {/* Actors grid with load more functionality */}
      <ActorGrid
        initialActors={actors}
        category={categoryFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}
