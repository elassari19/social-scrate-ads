import React from 'react';

import { Star } from 'lucide-react';

const Rate = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="h-3.5 w-3.5 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
      ))}
    </div>
  );
};

export default Rate;
