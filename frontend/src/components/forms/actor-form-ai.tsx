'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Database,
  Loader2,
  Wand2,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { storeCategories } from '@/utils/constants';
import {
  createActor,
  updateActor,
  deleteActor,
  configureActorWithAI,
  testActorScraping,
  configureResponseFilters,
} from '@/app/api/actor';
import { Actor } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Basic info schema (Step 1)
const basicInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().url().min(10, 'Icon URL is required'),
  price: z
    .number()
    .int()
    .min(1, 'Price must be at least 1')
    .default(5)
    .optional(),
  tags: z.array(z.string()).optional(),
});

// URL and scraping schema (Step 2)
const scrapingInfoSchema = z.object({
  domain: z
    .string()
    .url('Must be a valid domain URL')
    .min(3, 'Domain is required'),
  prompt: z.string().min(20, 'Tell us what data to extract'),
  generatedUrl: z.string().url().optional(),
});

// Export combined form type
export type ActorFormAIValues = z.infer<typeof basicInfoSchema> &
  z.infer<typeof scrapingInfoSchema>;

interface ActorFormAIProps {
  initialData?: Partial<Actor>;
  isEditing?: boolean;
}

export function ActorFormAI({
  initialData,
  isEditing = false,
}: ActorFormAIProps) {
  const router = useRouter();

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [totalSteps] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    Array.isArray(initialData?.tags) ? initialData.tags : []
  );

  // AI configuration state
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [propertyOptions, setPropertyOptions] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    initialData?.responseFilters?.properties || []
  );
  const [responseFilters, setResponseFilters] = useState<{
    path: string;
    properties: string[];
    defaultResult: number;
  }>(
    initialData?.responseFilters || {
      path: '',
      properties: [],
      defaultResult: 20,
    }
  );

  // If we have an actor ID when editing
  const [actorId, setActorId] = useState<string | undefined>(initialData?.id);

  // State for URL updating based on prompt
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');

  // Basic info form (Step 1)
  const basicInfoForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      icon: initialData?.icon || '',
      price: initialData?.price || 5,
      tags: selectedTags,
    },
  });

  // Scraping config form (Step 2)
  const scrapingForm = useForm<z.infer<typeof scrapingInfoSchema>>({
    resolver: zodResolver(scrapingInfoSchema),
    defaultValues: {
      domain: initialData?.domain || '',
      prompt: '',
      generatedUrl: initialData?.generatedUrl || '',
    },
  });

  // Effect to save original URL when it changes - fixed to avoid direct getValues() in dependency array
  useEffect(() => {
    const watchUrl = () => {
      const currentUrl = scrapingForm.getValues('generatedUrl');
      if (currentUrl && currentUrl !== originalUrl) {
        setOriginalUrl(currentUrl);
      }
    };

    // Set initial URL
    watchUrl();

    // Subscribe to URL field changes
    const subscription = scrapingForm.watch((value, { name }) => {
      if (name === 'generatedUrl') {
        watchUrl();
      }
    });

    return () => subscription.unsubscribe();
  }, [scrapingForm, originalUrl]);

  // Effect to auto-generate URL when prompt changes
  useEffect(() => {
    const subscription = scrapingForm.watch((value, { name }) => {
      // When the prompt field is changed and we have domain and actorId
      if (name === 'prompt') {
        const prompt = scrapingForm.getValues('prompt');
        const domain = scrapingForm.getValues('domain');

        // If we have all the required data and the prompt is valid length
        if (
          prompt &&
          prompt.length >= 20 &&
          domain &&
          actorId &&
          !isUpdatingUrl
        ) {
          // Auto-generate URL based on prompt without starting scraping
          handleUpdateUrlFromPrompt();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [actorId, isUpdatingUrl]);

  // Function to update URL based on prompt - No scraping
  const handleUpdateUrlFromPrompt = async () => {
    const domain = scrapingForm.getValues('domain');
    const prompt = scrapingForm.getValues('prompt');

    if (!domain || !prompt || !actorId) {
      toast.error('Domain, prompt, and actor ID are required');
      return;
    }

    try {
      setIsUpdatingUrl(true);

      // Call the DeepSeek API to generate a URL based on the prompt
      const response = await configureActorWithAI(actorId, {
        url: domain,
        prompt: `Modify this URL based on this prompt: ${prompt}. Return only the updated URL.`,
        skipScraping: true, // Add flag to skip the scraping part
      });

      if (!response.success) {
        throw new Error('Failed to update URL');
      }

      // Extract the URL from the response - it might be in the analysis object
      let updatedUrl = '';

      if (response.data && response.data.analysis) {
        // Try to extract URL from analysis
        if (
          typeof response.data.analysis === 'string' &&
          response.data.analysis.includes('http')
        ) {
          // Extract URL from string using regex
          const urlMatch = response.data.analysis.match(/(https?:\/\/[^\s]+)/g);
          if (urlMatch && urlMatch.length > 0) {
            updatedUrl = urlMatch[0];
          }
        } else if (response.data.analysis.url) {
          updatedUrl = response.data.analysis.url;
        }
      }

      // If we found a URL, update the form
      if (updatedUrl) {
        scrapingForm.setValue('generatedUrl', updatedUrl);
        toast.success('URL updated based on your prompt');
      } else {
        // If no URL found in response, keep original
        toast.info('Could not generate a new URL from prompt');
      }
    } catch (error: any) {
      console.error('Error updating URL:', error);
      toast.error(error.message || 'Failed to update URL');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  // Handle tag selection
  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  // Handle property selection
  const handlePropertyChange = (property: string) => {
    setSelectedProperties((prev) => {
      if (prev.includes(property)) {
        return prev.filter((p) => p !== property);
      } else {
        return [...prev, property];
      }
    });
  };

  // Step 1: Submit basic info
  const handleBasicInfoSubmit = async (
    data: z.infer<typeof basicInfoSchema>
  ) => {
    try {
      // If editing, we already have an actor ID
      if (isEditing && actorId) {
        await updateActor(actorId, {
          ...data,
          tags: selectedTags,
        });
        toast.success('Actor basic info updated');
        setStep(2);
        return;
      }

      // If creating new, we need to create a basic actor first
      setIsSubmitting(true);
      const response = await createActor({
        ...data,
        tags: selectedTags,
        url: '', // Will be updated in step 2
        responseFilters: {
          path: '',
          properties: [],
          defaultResult: 20,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create actor');
      }

      // Save the newly created actor ID for subsequent steps
      setActorId(response.data.id);
      toast.success('Actor created successfully');
      setStep(2);
    } catch (error: any) {
      console.error('Error saving basic info:', error);
      toast.error(error.message || 'Failed to save basic information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Configure with AI
  const handleScrapingSubmit = async (
    data: z.infer<typeof scrapingInfoSchema>
  ) => {
    if (!actorId) {
      toast.error('Actor ID is missing. Please try again.');
      return;
    }

    try {
      setIsConfiguring(true);
      const response = await configureActorWithAI(actorId, {
        url: data.domain,
        prompt: data.prompt,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to configure actor with AI');
      }

      // Update our state with AI-generated configuration
      setScrapedData(response.data.rawData);
      setPropertyOptions(response.data.propertyOptions || []);
      setResponseFilters(
        response.data.responseFilters || {
          path: '',
          properties: [],
          defaultResult: 20,
        }
      );
      setSelectedProperties(response.data.responseFilters?.properties || []);

      toast.success('AI successfully analyzed the data');
      setStep(3);
    } catch (error: any) {
      console.error('Error configuring with AI:', error);
      toast.error(error.message || 'Failed to configure with AI');
    } finally {
      setIsConfiguring(false);
    }
  };

  // Testing scraping with current configuration
  const handleTestScraping = async () => {
    if (!actorId) {
      toast.error('Actor ID is missing. Please try again.');
      return;
    }

    try {
      setIsTesting(true);
      const response = await testActorScraping(actorId, {
        url: scrapingForm.getValues('generatedUrl'),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to test scraping');
      }

      // Update our state with test results
      setScrapedData(response.data.data);
      setPropertyOptions(response.data.propertyOptions || []);

      toast.success('Test scraping completed successfully');
    } catch (error: any) {
      console.error('Error testing scraping:', error);
      toast.error(error.message || 'Failed to test scraping');
    } finally {
      setIsTesting(false);
    }
  };

  // Step 3: Save property filters and complete
  const handleSaveFilters = async () => {
    if (!actorId) {
      toast.error('Actor ID is missing. Please try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await configureResponseFilters(actorId, {
        path: responseFilters.path,
        properties: selectedProperties,
        defaultResult: responseFilters.defaultResult,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save response filters');
      }

      toast.success('Actor configuration completed successfully');
      router.push(`/store/actors/${response.data.namespace}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error saving filters:', error);
      toast.error(error.message || 'Failed to save response filters');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete actor
  const handleDelete = async () => {
    if (
      !actorId ||
      !confirm(
        'Are you sure you want to delete this actor? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await deleteActor(actorId);

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
  };

  // Render step navigation with progress starting from 0%
  const renderStepNav = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">
          Step {step} of {totalSteps}:{' '}
          {step === 1
            ? 'Basic Info'
            : step === 2
            ? 'Configure Scraping'
            : 'Response Filtering'}
        </h2>
        <div className="text-sm text-gray-500">
          {/* Progress shows 0% for step 1, 50% for step 2, 100% for step 3 */}
          {step === 1 ? 0 : step === 2 ? 50 : 100}% Complete
        </div>
      </div>
      <Progress
        value={step === 1 ? 0 : step === 2 ? 50 : 100}
        className="h-2"
      />
    </div>
  );

  return (
    <Card className="p-6 space-y-6">
      {renderStepNav()}

      {/* Step 1: Basic Actor Info */}
      {step === 1 && (
        <form
          onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Actor"
                  {...basicInfoForm.register('title')}
                />
                {basicInfoForm.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {basicInfoForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (per 1000 results)</Label>
                <Input
                  id="price"
                  type="number"
                  defaultValue={5}
                  min={0}
                  {...basicInfoForm.register('price', { valueAsNumber: true })}
                />
                {basicInfoForm.formState.errors.price && (
                  <p className="text-sm text-red-500">
                    {basicInfoForm.formState.errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon URL</Label>
              <Input
                id="icon"
                placeholder="https://example.com/icon.png"
                {...basicInfoForm.register('icon')}
              />
              {basicInfoForm.formState.errors.icon && (
                <p className="text-sm text-red-500">
                  {basicInfoForm.formState.errors.icon.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your actor does and how it works"
                rows={3}
                {...basicInfoForm.register('description')}
              />
              {basicInfoForm.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {basicInfoForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border rounded-md p-3">
                {storeCategories.map((category) => (
                  <div
                    key={category.url}
                    className="flex items-center space-x-2"
                  >
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
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Configure Scraping with AI */}
      {step === 2 && (
        <form
          onSubmit={scrapingForm.handleSubmit(handleScrapingSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain to Scrape</Label>
              <Input
                id="domain"
                placeholder="https://example.com"
                {...scrapingForm.register('domain')}
              />
              {scrapingForm.formState.errors.domain && (
                <p className="text-sm text-red-500">
                  {scrapingForm.formState.errors.domain.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Enter the domain that contains the data you want to extract
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">What data do you want to extract?</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what data you want to extract (e.g., product prices, titles, descriptions)"
                rows={3}
                {...scrapingForm.register('prompt')}
              />
              {scrapingForm.formState.errors.prompt && (
                <p className="text-sm text-red-500">
                  {scrapingForm.formState.errors.prompt.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Be specific about what data you want to extract from the website
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generatedUrl">Generated URL</Label>
              <Input
                id="generatedUrl"
                placeholder="https://example.com/page"
                {...scrapingForm.register('generatedUrl')}
              />
              {scrapingForm.formState.errors.generatedUrl && (
                <p className="text-sm text-red-500">
                  {scrapingForm.formState.errors.generatedUrl.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                This URL is generated based on the domain and prompt
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Wand2 className="h-4 w-4 mr-2" />
                <span>
                  Our AI will analyze the page and configure the actor for you
                </span>
              </div>

              <p className="text-xs text-gray-500">
                The system will visit the domain, analyze the content, and set
                up the appropriate response filters based on your description.
              </p>
            </div>

            {scrapedData && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">Preview of Detected Data</h3>
                <div className="bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(scrapedData, null, 2).substring(0, 500)}...
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestScraping}
                disabled={isTesting || !scrapingForm.getValues('generatedUrl')}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" /> Test Scraping
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleUpdateUrlFromPrompt}
                disabled={isUpdatingUrl || !scrapingForm.getValues('prompt')}
              >
                {isUpdatingUrl ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Update URL
                  </>
                )}
              </Button>

              <Button type="submit" disabled={isConfiguring}>
                {isConfiguring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Configuring...
                  </>
                ) : (
                  <>
                    Configure with AI <Wand2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Response Property Filtering */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="path">Data Path</Label>
                <Input
                  id="path"
                  value={responseFilters.path}
                  onChange={(e) =>
                    setResponseFilters({
                      ...responseFilters,
                      path: e.target.value,
                    })
                  }
                  placeholder="e.g., data.items"
                />
                <p className="text-xs text-gray-500">
                  The path to the array of items in the response
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultResult">Results Limit</Label>
                <Input
                  id="defaultResult"
                  type="number"
                  value={responseFilters.defaultResult}
                  onChange={(e) =>
                    setResponseFilters({
                      ...responseFilters,
                      defaultResult: parseInt(e.target.value) || 20,
                    })
                  }
                  min={1}
                  max={1000}
                />
                <p className="text-xs text-gray-500">
                  Maximum number of results to return (1-1000)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Properties to Include</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {propertyOptions.map((property) => (
                    <div key={property} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prop-${property}`}
                        checked={selectedProperties.includes(property)}
                        onCheckedChange={() => handlePropertyChange(property)}
                      />
                      <Label
                        htmlFor={`prop-${property}`}
                        className="text-sm cursor-pointer"
                      >
                        {property}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProperties.length > 0 && (
                <div className="mt-2">
                  <Label className="mb-1 block">Selected Properties</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedProperties.map((property) => (
                      <Badge variant="secondary" key={property}>
                        {property}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePropertyChange(property)}
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {scrapedData && (
              <div className="bg-muted/30 rounded-lg p-4">
                <Tabs defaultValue="raw" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    <TabsTrigger value="filtered">Filtered Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="raw" className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded border max-h-60 overflow-y-auto">
                      <pre className="text-xs font-mono">
                        {JSON.stringify(scrapedData, null, 2).substring(
                          0,
                          1000
                        )}
                        ...
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="filtered" className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded border max-h-60 overflow-y-auto">
                      <pre className="text-xs font-mono">
                        {JSON.stringify(
                          scrapedData,
                          (key, value) => {
                            // Simple filtering preview
                            if (
                              typeof value === 'object' &&
                              value !== null &&
                              !Array.isArray(value)
                            ) {
                              const filtered: any = {};
                              Object.keys(value).forEach((k) => {
                                if (selectedProperties.includes(k)) {
                                  filtered[k] = value[k];
                                }
                              });
                              return Object.keys(filtered).length > 0
                                ? filtered
                                : value;
                            }
                            return value;
                          },
                          2
                        ).substring(0, 1000)}
                        ...
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex space-x-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Actor
                </Button>
              )}

              <Button onClick={handleSaveFilters} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Complete Setup
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
