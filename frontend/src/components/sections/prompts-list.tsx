'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Check, X, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePrompt, updatePrompt, scrapeData } from '@/app/api/actor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface PromptItem {
  id: string;
  prompt: string;
  responseUrl: string;
  namespace: string;
  userId: string;
}

interface PromptsListProps {
  namespace: string;
  initialPrompts: PromptItem[];
}

export default function PromptsList({
  namespace,
  initialPrompts,
}: PromptsListProps) {
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [isScrapingData, setIsScrapingData] = useState(false);
  const [scrapedData, setScrapedData] = useState<string>('');
  const [scrapeDialogOpen, setScrapeDialogOpen] = useState(false);
  const [customScrapePrompt, setCustomScrapePrompt] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [scrapeResultDialogOpen, setScrapeResultDialogOpen] = useState(false);

  const handleEdit = (prompt: PromptItem) => {
    setEditingId(prompt.id);
    setEditedPrompt(prompt.prompt);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedPrompt('');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await updatePrompt(id, { prompt: editedPrompt });
      if (response.success) {
        setPrompts(
          prompts.map((p) => (p.id === id ? { ...p, prompt: editedPrompt } : p))
        );
        toast.success('Prompt updated successfully');
      } else {
        toast.error(response.error || 'Failed to update prompt');
      }
    } catch (error) {
      toast.error('An error occurred while updating the prompt');
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deletePrompt(id);
      if (response.success) {
        setPrompts(prompts.filter((p) => p.id !== id));
        toast.success('Prompt deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete prompt');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the prompt');
    }
  };

  const confirmDelete = (id: string) => {
    toast.promise(
      new Promise((resolve, reject) => {
        if (confirm('Are you sure you want to delete this prompt?')) {
          handleDelete(id).then(resolve).catch(reject);
        } else {
          reject();
        }
      }),
      {
        loading: 'Deleting prompt...',
        success: 'Prompt deleted successfully',
        error: 'Prompt deleted cancelled',
      }
    );
  };

  const openScrapeDialog = (prompt: PromptItem) => {
    setCurrentPrompt(prompt);
    setCustomScrapePrompt(
      `Extract and analyze data from this URL based on my original prompt: ${prompt.prompt}`
    );
    setScrapeDialogOpen(true);
  };

  const handleScrapeData = async () => {
    if (!currentPrompt) return;

    setIsScrapingData(true);
    setScrapeDialogOpen(false);
    setScrapeResultDialogOpen(true);

    try {
      const response = await scrapeData(
        currentPrompt.id,
        currentPrompt.responseUrl,
        customScrapePrompt || currentPrompt.prompt,
        namespace
      );

      if (response.success) {
        const data = response.data;
        const formattedData =
          typeof data === 'object'
            ? JSON.stringify(data, null, 2)
            : String(data);

        setScrapedData(formattedData);
        toast.success('Data scraped successfully');
      } else {
        setScrapedData('// Failed to scrape data');
        toast.error(response.error || 'Failed to scrape data');
      }
    } catch (error) {
      console.error('Error scraping data:', error);
      setScrapedData('// Error while scraping data');
      toast.error('Error scraping data from URL');
    } finally {
      setIsScrapingData(false);
    }
  };

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="p-4">
          {editingId === prompt.id ? (
            <div className="mb-2">
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full p-2 min-h-[100px]"
                placeholder="Edit your prompt..."
              />
              <div className="flex justify-end mt-2 space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-8"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(prompt.id)}
                  className="h-8"
                >
                  <Check className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Badge variant="outline" className="font-semibold mb-2">
                  Prompt:
                </Badge>
                <p className="pl-4 break-words">{prompt.prompt}</p>
              </div>
              <div className="flex-shrink-0 flex space-x-2 ml-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleEdit(prompt)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => confirmDelete(prompt.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="mb-2 font-semibold bg-white">
                Response URL
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openScrapeDialog(prompt)}
                className="h-7 text-xs"
              >
                <Database className="w-3 h-3 mr-1" /> Scrape Data
              </Button>
            </div>
            <div className="font-mono overflow-x-scroll text-nowrap pb-3">
              <Link
                href={prompt.responseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {prompt.responseUrl}
              </Link>
            </div>
          </div>
        </Card>
      ))}

      {/* Prompt for custom scraping input */}
      <Dialog open={scrapeDialogOpen} onOpenChange={setScrapeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Scrape Data</DialogTitle>
            <DialogDescription>
              Enter your data extraction prompt to customize the scraping
              process.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="scrape-prompt">
              What data would you like to extract?
            </Label>
            <Textarea
              id="scrape-prompt"
              value={customScrapePrompt}
              onChange={(e) => setCustomScrapePrompt(e.target.value)}
              placeholder="Extract all product prices, descriptions, and ratings..."
              className="mt-2"
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScrapeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleScrapeData}>Start Scraping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for displaying scraped data results */}
      <Dialog
        open={scrapeResultDialogOpen}
        onOpenChange={setScrapeResultDialogOpen}
      >
        <DialogContent className="w-[90vw]">
          <DialogHeader>
            <DialogTitle>Scraped Data</DialogTitle>
            <DialogDescription className="max-w-full">
              {currentPrompt && (
                <div className="text-sm max-w-full overflow-x-auto whitespace-nowrap pb-2">
                  From URL:{' '}
                  <a
                    href={currentPrompt.responseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {currentPrompt.responseUrl}
                  </a>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 overflow-auto max-h-[60vh] w-full">
            {isScrapingData ? (
              <div className="flex flex-col items-center justify-center py-8 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-gray-500">
                  Scraping data using AI...
                </p>
              </div>
            ) : (
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap w-full">
                {scrapedData}
              </pre>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(scrapedData);
                toast.success('Data copied to clipboard');
              }}
              disabled={isScrapingData || !scrapedData}
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
