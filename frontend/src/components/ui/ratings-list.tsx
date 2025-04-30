'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, RefreshCw, Brain } from 'lucide-react';
import {
  getActorRatings,
  deleteRating,
  analyzeActorRatings,
} from '@/app/api/actor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface RatingsListProps {
  actorId: string;
  currentUserId?: string;
  onRatingDeleted?: () => void;
  className?: string;
}

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

export default function RatingsList({
  actorId,
  currentUserId,
  onRatingDeleted,
  className,
}: RatingsListProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const result = await getActorRatings(actorId);
      if (result.success) {
        setRatings(result.data);
      } else {
        toast.error('Failed to load ratings');
      }
    } catch (error) {
      // console.error('Error fetching ratings:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [actorId]);

  const handleDeleteRating = async () => {
    if (!ratingToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteRating(ratingToDelete);

      if (result.success) {
        setRatings(ratings.filter((r) => r.id !== ratingToDelete));
        toast.success('Your rating has been removed');

        if (onRatingDeleted) {
          onRatingDeleted();
        }
      } else {
        toast.error('Failed to delete rating');
      }
    } catch (error) {
      // console.error('Error deleting rating:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsDeleting(false);
      setRatingToDelete(null);
    }
  };

  const handleAnalyzeRatings = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysis(null);

      const result = await analyzeActorRatings(actorId);

      if (result.success) {
        setAnalysis(
          typeof result.data.analysis === 'string'
            ? result.data.analysis
            : JSON.stringify(result.data.analysis, null, 2)
        );
      } else {
        toast.error('Failed to analyze ratings');
      }
    } catch (error) {
      console.error('Error analyzing ratings:', error);
      toast.error('Failed to analyze ratings');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">Loading ratings...</div>;
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No ratings yet. Be the first to rate this actor!
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Ratings & Reviews ({ratings.length})
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyzeRatings}
          disabled={isAnalyzing || ratings.length < 3}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Ratings
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
          <h4 className="font-medium mb-2">AI Analysis</h4>
          <p className="text-sm whitespace-pre-wrap">{analysis}</p>
        </div>
      )}

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="border border-gray-200 rounded-md p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="font-medium">{rating.user.name}</div>
                  {rating.userId === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      You
                    </span>
                  )}
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(rating.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index <= rating.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rating.userId === currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRatingToDelete(rating.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            {rating.comment && (
              <p className="mt-2 text-sm text-gray-700">{rating.comment}</p>
            )}
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!ratingToDelete}
        onOpenChange={() => setRatingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your rating? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRating}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
