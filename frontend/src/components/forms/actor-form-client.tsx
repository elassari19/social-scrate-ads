'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { storeCategories } from '@/utils/constants';
import { createActor, updateActor, deleteActor } from '@/app/api/actor';
import { Actor } from '../../types';

// Actor build form schema
const actorSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  icon: z.string().url().min(10, 'Icon URL is required'),
  url: z.string().url('Must be a valid URL').min(20, 'URL is required'),
  price: z.number().int().min(0).default(1000), // Add price field
  tags: z.array(z.string()).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pageContent: z.string().optional(),
});

export type ActorFormValues = z.infer<typeof actorSchema>;

interface ActorFormClientProps {
  initialData?: Partial<Actor>;
  isEditing?: boolean;
}

export function ActorFormClient({
  initialData,
  isEditing = false,
}: ActorFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    Array.isArray(initialData?.tags) ? initialData.tags : []
  );

  const defaultValues: Partial<ActorFormValues> = {
    title: '',
    namespace: '',
    description: '',
    icon: '',
    url: '',
    price: 5,
    tags: [],
    pageContent: `// Example page DOM to scrape a website
      <main><div><h1>Example Title</h1><p>Example description</p></d></main> `,
    ...initialData,
  };

  const form = useForm<ActorFormValues>({
    resolver: zodResolver(actorSchema),
    defaultValues,
  });

  const handleSubmit = async (data: ActorFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the data with selected tags
      const actorData = {
        ...data,
        tags: selectedTags,
        // Convert pageContent to page as expected by the backend
        page: data.pageContent,
        // Remove the pageContent field as it's not expected by the backend
        pageContent: undefined,
      };

      let response;

      if (isEditing && initialData?.id) {
        // Update existing actor
        response = await updateActor(initialData.id, actorData);
      } else {
        // Create new actor
        response = await createActor(actorData);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit actor');
      }

      toast.success(
        isEditing ? 'Actor updated successfully' : 'Actor created successfully'
      );

      // Reset form data after successful submission
      if (!isEditing) {
        form.reset({
          title: '',
          description: '',
          icon: '',
          url: '',
          tags: [],
          pageContent: `// Example page DOM to scrape a website using AI
`,
        });
        setSelectedTags([]);
      }

      // Force a refresh to ensure updated data is displayed
      router.push('/store/actors');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting actor:', error);
      toast.error(error.message || 'Failed to submit actor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleDelete = async () => {
    if (
      confirm(
        'Are you sure you want to delete this actor? This action cannot be undone.'
      )
    ) {
      if (!initialData?.id) {
        toast.error('Cannot delete actor: missing ID');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await deleteActor(initialData.id);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete actor');
        }

        toast.success('Actor deleted successfully');
        router.push('/store/actors');
        router.refresh();
      } catch (error: any) {
        console.error('Error deleting actor:', error);
        toast.error(error.message || 'Failed to delete actor');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Actor"
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (per 1000 result)</Label>
              <Input
                id="price"
                type="number"
                defaultValue={5}
                min={0}
                {...form.register('price', { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...form.register('url')}
              />
              {form.formState.errors.url && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.url.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                placeholder="Icon URL"
                {...form.register('icon')}
              />
              {form.formState.errors.icon && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.icon.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your actor does and how it works"
              rows={3}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border rounded-md p-3">
              {storeCategories.map((category) => (
                <div key={category.url} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${category.url}`}
                    checked={selectedTags.includes(category.name)}
                    onCheckedChange={() => handleTagChange(category.name)}
                  />
                  <Label
                    htmlFor={`tag-${category.url}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {form.formState.errors.tags && (
              <p className="text-sm text-red-500">
                {form.formState.errors.tags.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageContent">
              Puppeteer Script
              <span className="text-xs text-gray-500 ml-1">
                (JavaScript code to scrape websites)
              </span>
            </Label>
            <Textarea
              id="pageContent"
              placeholder="// Your Puppeteer script here"
              className="font-mono text-sm h-80"
              {...form.register('pageContent')}
            />
            {form.formState.errors.pageContent && (
              <p className="text-sm text-red-500">
                {form.formState.errors.pageContent.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <div className="flex space-x-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Submitting...'
                : isEditing
                ? 'Update Actor'
                : 'Create Actor'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
