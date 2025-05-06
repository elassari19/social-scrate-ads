'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateActorUrl } from '@/app/api/actor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Actor } from '../../types';

interface ActorExecutorProps {
  actor: Actor;
}

export default function ActorExecutor({ actor }: ActorExecutorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState(actor.url);
  const [defaultResult, setDefaultResult] = useState(
    actor.responseFilters?.defaultResult || 10
  );
  const [loading, setLoading] = useState(false);

  // Handle actor execution using the generateActorUrl function
  const handleExecuteActor = async () => {
    try {
      setLoading(true);

      // Use the generateActorUrl function which is specifically designed for this API
      const { success, data, error } = await generateActorUrl(
        actor.namespace,
        platform.trim(),
        prompt.trim(),
        {
          actorType: 'generic',
          maxResult: defaultResult,
        }
      );

      if (!success) {
        toast.error(error || 'Failed to execute actor. Please try again.');
        return;
      }

      toast.success(
        `Generated URL queries for Actor "${actor.title}" successfully!`
      );

      // Close the dialog after successful submission
      setOpen(false);
    } catch (error) {
      console.error('Error executing actor:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to execute actor'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Execute Actor Button */}
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        Generate URL
      </button>

      {/* Execute Actor Dialog */}
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!loading) setOpen(newOpen);
        }}
      >
        <DialogContent className="w-full md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate {actor.title} URL queries</DialogTitle>
            <DialogDescription>
              Enter a prompt to generate new URL queries for the actor.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform URL</Label>
              <Input
                id="platform"
                placeholder="Enter target platform (e.g., facebook, twitter, linkedin)"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultResult">Scrape Result</Label>
              <Input
                id="defaultResult"
                type="number"
                min={10}
                placeholder="Minimum number of results to return"
                value={defaultResult}
                onChange={(e) => setDefaultResult(Number(e.target.value))}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                How many results should be returned (minimum: 10)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Find ads for a specific product, location, or any other criteria."
                className="min-h-[120px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleExecuteActor}
              disabled={!prompt.trim() || loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Prompt'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
