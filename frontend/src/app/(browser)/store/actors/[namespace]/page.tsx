import React from 'react';
import { getActorByNamespace, getActorRatings } from '@/app/api/actor';
import { Edit, Star, Tag, User } from 'lucide-react';
import Link from 'next/link';
import ActorExecutor from '@/components/ui/actor-executor';

interface IProps {
  params: Promise<{
    namespace: string;
  }>;
}

async function page({ params }: IProps) {
  const { namespace } = await params;
  // Fetch actor data using the namespace
  const { data: actorResponse, success } = await getActorByNamespace(namespace);

  // Fetch actor ratings
  const { data: ratingsResponse } = actorResponse
    ? await getActorRatings(actorResponse.id.toString())
    : { data: null };

  if (!success || !actorResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Actor not found</h1>
        <p className="mt-4">
          The actor you are looking for could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header with icon and title */}
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          {actorResponse.icon && (
            <div className="w-16 h-16 mr-4 relative">
              <img
                src={actorResponse.icon}
                alt={actorResponse.title}
                width={64}
                height={64}
                className="rounded-md"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{actorResponse.title}</h1>
            <div className="flex items-center mt-2">
              <User className="w-4 h-4 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                by {actorResponse.authorName}
              </span>

              {actorResponse.averageRating && (
                <div className="flex items-center ml-4">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>{actorResponse.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="">
            <Link
              href={`/store/actors/${namespace}/edit`}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-1 text-white" />
              Edit Actor
            </Link>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {actorResponse.description}
          </p>
        </div>

        {/* Tags */}
        {actorResponse.tags && actorResponse.tags.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {actorResponse.tags.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="bg-orange-50 px-3 py-1 rounded-full flex items-center"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  <span className="text-sm font-semibold">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ratings */}
        {ratingsResponse && ratingsResponse.length > 0 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Reviews</h2>
            <div className="space-y-4">
              {ratingsResponse.slice(0, 5).map((rating: any) => (
                <div
                  key={rating.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4"
                >
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                          fill={i < rating.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {rating.userName || 'Anonymous'}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 dark:text-gray-300">
                      {rating.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {ratingsResponse.length > 5 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing 5 of {ratingsResponse.length} reviews
                </p>
              </div>
            )}
          </div>
        )}

        {/* Execute Actor Button Section */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <ActorExecutor
            actorId={actorResponse.id}
            actorTitle={actorResponse.title}
            namespace={actorResponse.namespace}
          />
        </div>
      </div>
    </div>
  );
}

export default page;
