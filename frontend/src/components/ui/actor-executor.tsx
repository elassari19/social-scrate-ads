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
import { Loader2, Code, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { executeActorWithDeepSeek } from '@/app/api/actor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActorExecutorProps {
  namespace: string;
  actorTitle: string;
  platformUrl: string;
}

export default function ActorExecutor({
  namespace,
  actorTitle,
  platformUrl,
}: ActorExecutorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState(platformUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Handle actor execution using the executeActorWithDeepSeek function
  const handleExecuteActor = async () => {
    try {
      setLoading(true);

      // Use the executeActorWithDeepSeek function which is specifically designed for this API
      const { success, data, error } = await executeActorWithDeepSeek(
        namespace,
        platform,
        prompt.trim(),
        {
          actorType: 'generic',
        }
      );

      console.log('Actor execution result:', { success, data, error });

      if (!success) {
        throw new Error(error || 'Failed to execute actor');
      }

      console.log('Actor execution successful:', data);
      setResult(data);

      toast.success(`Actor "${actorTitle}" executed successfully!`);

      // No longer closing the dialog after successful submission
      // so the user can see the results
    } catch (error) {
      console.error('Error executing actor:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to execute actor'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle using existing Puppeteer script to scrape
  const handleUseExistingScript = () => {
    try {
      toast.info('Preparing to use existing Puppeteer script...');
      // Add your logic to use existing Puppeteer script
      // You would typically redirect or open another dialog here

      // For demonstration, we're just showing a toast
      toast.success('Using existing Puppeteer script with the actor results');
    } catch (error) {
      console.error('Error using existing Puppeteer script:', error);
      toast.error('Failed to use existing Puppeteer script');
    }
  };

  // Handle generating new Puppeteer script
  const handleGenerateNewScript = () => {
    try {
      toast.info('Preparing to generate a new Puppeteer script...');
      // Add your logic to generate new Puppeteer script
      // You would typically redirect or open another dialog here

      // For demonstration, we're just showing a toast
      toast.success('Generating new Puppeteer script based on actor results');
    } catch (error) {
      console.error('Error generating new Puppeteer script:', error);
      toast.error('Failed to generate new Puppeteer script');
    }
  };

  return (
    <>
      {/* Execute Actor Button */}
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        Execute this Actor
      </button>

      {/* Execute Actor Dialog */}
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!loading) {
            setOpen(newOpen);
            if (!newOpen) setResult(null); // Reset result when closing
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execute {actorTitle}</DialogTitle>
            <DialogDescription>
              Enter a prompt and platform for this actor to process.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform URL</Label>
              <Input
                id="platform"
                placeholder="Enter target platform URL (e.g., facebook, twitter, linkedin)"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Find ads that contain | Sandwiches | Cheese |..."
                className="min-h-[120px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Display results inside the dialog when available */}
            {result && (
              <>
                <div className="mt-6 p-4 border rounded-md bg-gray-50 max-h-[40vh] overflow-y-auto">
                  <div>
                    <h3 className="font-medium">Your Prompt:</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">
                      {result?.prompt}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">Your Scraped URL:</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">
                      {result?.url}
                    </pre>
                  </div>
                </div>

                {/* New Puppeteer script buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUseExistingScript}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scrape with Existing Puppeteer Script
                  </Button>
                  <Button
                    onClick={handleGenerateNewScript}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Generate New Puppeteer Script
                  </Button>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                {result ? 'Close' : 'Cancel'}
              </Button>
            </DialogClose>
            {!result && (
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
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keeping the results component outside the dialog as well for reference */}
      {result && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium">Execution Result:</h3>
          <pre className="mt-2 whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
