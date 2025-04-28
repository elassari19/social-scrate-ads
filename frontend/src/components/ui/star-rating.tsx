'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { rateActor, updateRating, getUserRating } from '@/lib/actor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface StarRatingProps {
  actorId: string;
  onRatingSubmitted?: (newRating: number) => void;
  className?: string;
}

export default function StarRating({
  actorId,
  onRatingSubmitted,
  className,
}: StarRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [userRatingId, setUserRatingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the user's existing rating on component mount
  React.useEffect(() => {
    const fetchUserRating = async () => {
      try {
        setIsLoading(true);
        const result = await getUserRating(actorId);
        if (result.success && result.data) {
          setRating(result.data.rating);
          setComment(result.data.comment || '');
          setUserRatingId(result.data.id);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRating();
  }, [actorId]);

  const handleMouseEnter = (index: number) => {
    setHoveredRating(index);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (index: number) => {
    setRating(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (userRatingId) {
        // Update existing rating
        result = await updateRating(userRatingId, { rating, comment });
      } else {
        // Create new rating
        result = await rateActor(actorId, rating, comment);
      }

      if (result.success) {
        toast.success('Thank you for your feedback!');

        if (result.data?.id && !userRatingId) {
          setUserRatingId(result.data.id);
        }

        if (onRatingSubmitted) {
          onRatingSubmitted(rating);
        }
      } else {
        toast.error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">Loading your rating...</div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <Star
              key={index}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                index <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this actor (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : userRatingId
              ? 'Update Rating'
              : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </div>
  );
}
