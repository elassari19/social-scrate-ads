'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { deletePrompt, updatePrompt } from '@/app/api/actor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
            <Badge variant="outline" className="mb-2 font-semibold">
              Response URL
            </Badge>
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
    </div>
  );
}
