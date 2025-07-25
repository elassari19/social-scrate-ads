import {
  Actor,
  PrismaClient,
  Prisma,
  ActorRating,
  ActorPrompt,
} from '@prisma/client';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { createDeepSeekService, DeepSeekService } from '../../lib/deepseek';
import { redisClient } from '../../lib/redis';

const prisma = new PrismaClient();

export class ActorService {
  private deepSeekService: DeepSeekService;
  constructor(
    private actorService: ActorService,
    private puppeteerService: PuppeteerService
  ) {
    // Initialize the DeepSeekService with Redis for caching
    const redis = redisClient;
    this.deepSeekService = createDeepSeekService(
      process.env.DEEPSEEK_API_KEY,
      redis
    );
  }

  async getAllActors(
    userId?: string,
    take?: number,
    page?: number,
    search?: string,
    category?: string
  ): Promise<Actor[]> {
    // Build where clause for filtering
    const where: Prisma.ActorWhereInput = {};

    // Filter by user if provided
    if (userId) {
      where.userId = userId;
    }

    // Filter by search term if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { namespace: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by category if provided
    if (category) {
      where.tags = {
        has: category, // Change from hasSome to has to match exact category
      };
    }

    return prisma.actor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take || 15,
      skip: page ? (page - 1) * (take || 15) : 0,
      include: {
        // Include ratings count and average rating
        ratings: {
          select: {
            rating: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getActorById(id: string, userId?: string): Promise<Actor | null> {
    return prisma.actor.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });
  }

  async getActorByNamespace(namespace: string): Promise<Actor | null> {
    return prisma.actor.findUnique({
      where: { namespace },
    });
  }

  async createActor(
    actorData: Omit<Actor, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<Actor> {
    // Ensure script is a valid JSON object
    const page = actorData.page || {};

    // Ensure tags is an array
    const tags = Array.isArray(actorData.tags) ? actorData.tags : [];

    return prisma.actor.create({
      data: {
        title: actorData.title,
        namespace: actorData.title.toLowerCase().replace(/\s+/g, '-'),
        description: actorData.description,
        authorName: actorData.authorName,
        icon: actorData.icon,
        url: actorData.url,
        price: actorData.price || 5, // Set price with default 1000
        tags,
        page: JSON.parse(JSON.stringify(page)),
        userId,
      },
    });
  }

  async updateActor(
    id: string,
    actorData: Partial<Actor>,
    userId: string
  ): Promise<Actor> {
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to update it'
      );
    }

    // Prepare the data for update
    const updateData: any = { ...actorData };

    // Only process script if it's provided
    if (actorData.page) {
      updateData.page = JSON.parse(JSON.stringify(actorData.page));
    }

    // Handle tags array if provided
    if (actorData.tags !== undefined) {
      updateData.tags = Array.isArray(actorData.tags) ? actorData.tags : [];
    }

    return prisma.actor.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteActor(id: string, userId: string): Promise<Actor> {
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to delete it'
      );
    }

    return prisma.actor.delete({
      where: { id },
    });
  }

  async generateActorUrl(
    namespace: string,
    platformUrl: string,
    prompt: string,
    context: Record<string, any>,
    userId: string
  ) {
    try {
      const urlPrompt = `Update the URL ${platformUrl} queries,
      - the URL should be following the user prompt: ${prompt}.
      - The URL should be a valid URL that can be used to fetch data from the platform.
      - The Prompt can have multiple requirements like: location, limit, offset, filters, etc.
      - The URL should be in the format of ${platformUrl}.
      - Return ONLY a URL:
      `;
      // Generate a URL based on the platform URL
      const generateUrl = await this.deepSeekService.generateUrl(
        platformUrl,
        urlPrompt,
        context
      );

      await prisma.actorPrompt.create({
        data: {
          namespace,
          userId,
          responseUrl: generateUrl,
          prompt,
        },
      });

      return generateUrl;
    } catch (error) {
      console.error('Error generating actor URL:', error);
      throw new Error('Failed to generate actor URL');
    }
  }

  // ==================   PROMPTS   ===========================
  async getActorPrompt(namespace: string) {
    return prisma.actorPrompt.findMany({
      where: { namespace },
    });
  }

  // Update a prompt
  async updatePrompt(
    id: string,
    userId: string,
    data: { prompt?: string }
  ): Promise<ActorPrompt> {
    // Verify ownership
    const existingPrompt = await prisma.actorPrompt.findFirst({
      where: { id, userId },
    });

    if (!existingPrompt) {
      throw new Error(
        'Prompt not found or you do not have permission to update it'
      );
    }

    const urlPrompt = `Update the URL ${existingPrompt.responseUrl} queries,
    - the URL should be following the user prompt: ${data.prompt}.
    - The URL should be a valid URL that can be used to fetch data from the platform.
    - The Prompt can have multiple requirements like: location, limit, offset, filters, etc.
    - The URL should be in the format of ${existingPrompt.namespace}.
    - Return ONLY a URL:
    `;
    // Generate a URL based on the platform URL
    const generateUrl = await this.deepSeekService.generateUrl(
      existingPrompt.responseUrl!,
      urlPrompt
    );

    return prisma.actorPrompt.update({
      where: { id },
      data: {
        prompt: data.prompt !== undefined ? data.prompt : existingPrompt.prompt,
        responseUrl: generateUrl,
      },
    });
  }

  // Delete a prompt
  async deletePrompt(id: string, userId: string): Promise<boolean> {
    // Verify ownership
    const prompt = await prisma.actorPrompt.findFirst({
      where: { id, userId },
    });

    if (!prompt) {
      throw new Error(
        'Prompt not found or you do not have permission to delete it'
      );
    }

    await prisma.actorPrompt.delete({ where: { id } });
    return true;
  }

  async executeActor(id: string, options?: any): Promise<any> {
    const actor = await prisma.actor.findUnique({
      where: { id },
    });

    if (!actor) {
      throw new Error('Actor not found');
    }

    // Create a new execution record
    const execution = await prisma.actorExecution.create({
      data: {
        actorId: id,
        status: 'running',
      },
    });

    try {
      // Update status to running
      await prisma.actorExecution.update({
        where: { id: execution.id },
        data: { status: 'running' },
      });

      // Create a new browser page
      const page = await this.puppeteerService.createPage();

      try {
        // Execute the script
        // We're wrapping the user script in an async function
        const scriptFunction = new Function(
          'page',
          'options',
          `
          return (async () => {
            try {
              ${actor.page}
            } catch (error) {
              return { error: error.message };
            }
          })();
        `
        );

        const results = await scriptFunction(page, options);

        // Update execution record with results
        const completedExecution = await prisma.actorExecution.update({
          where: { id: execution.id },
          data: {
            status: 'completed',
            endTime: new Date(),
            results: results || {},
          },
        });

        return completedExecution;
      } finally {
        // Always close the page
        await page.close();
      }
    } catch (error) {
      // Update execution record with error
      await prisma.actorExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          endTime: new Date(),
          logs: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  // Helper method to execute script in a page with pagination support
  private async executeScriptWithPagination(
    page: any,
    script: string,
    pagination?: { nextPageSelector?: string; maxPages?: number }
  ): Promise<Record<string, any>> {
    // Wrap the script to provide proper error handling and data return
    const scriptWithWrapping = `
      (async () => {
        try {
          ${script}
          return data || {}; // Return the data object that the script is expected to populate
        } catch (error) {
          console.error("Script execution error:", error);
          return { error: error.message };
        }
      })()
    `;

    // Execute the script on the current page
    let scrapedData = (await page.evaluate(scriptWithWrapping)) as Record<
      string,
      any
    >;

    // If pagination is enabled and we have a next page selector
    if (
      pagination?.nextPageSelector &&
      pagination.maxPages &&
      pagination.maxPages > 1
    ) {
      let currentPage = 1;

      while (currentPage < pagination.maxPages) {
        // Check if next page button exists and is visible
        const hasNextPage = await page.evaluate((nextPageSelector: string) => {
          const nextButton = document.querySelector(nextPageSelector);
          // Need to cast to HTMLElement to access offsetParent
          return (
            nextButton && (nextButton as HTMLElement).offsetParent !== null
          );
        }, pagination.nextPageSelector);

        if (!hasNextPage) break;

        // Click next page and wait for navigation
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.click(pagination.nextPageSelector),
        ]);

        // Execute the script on the new page
        const newPageData = await page.evaluate(scriptWithWrapping);

        // Merge the new data with the existing data
        scrapedData = this.mergePageData(scrapedData, newPageData);

        currentPage++;
      }
    }

    return scrapedData;
  }

  // Helper function to merge data from multiple pages
  private mergePageData(existingData: any, newData: any): any {
    const merged = { ...existingData };

    // Loop through the properties of the new data
    for (const [key, value] of Object.entries(newData)) {
      // If the property doesn't exist in the merged object, add it
      if (!merged[key]) {
        merged[key] = value;
        continue;
      }

      // If both values are arrays, concatenate them
      if (Array.isArray(merged[key]) && Array.isArray(value)) {
        merged[key] = [...merged[key], ...value];
      }
      // If existing value is an array but new value is not, push the new value
      else if (Array.isArray(merged[key])) {
        merged[key].push(value);
      }
      // If new value is an array but existing value is not, create a new array with both
      else if (Array.isArray(value)) {
        merged[key] = [merged[key], ...value];
      }
      // If neither is an array, create a new array with both values
      else {
        merged[key] = [merged[key], value];
      }
    }

    return merged;
  }

  async getActorExecutions(id: string, limit = 10): Promise<any[]> {
    return prisma.actorExecution.findMany({
      where: { id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // New method to get actor's average rating
  async getActorAverageRating(actorId: string): Promise<number | null> {
    const ratings = await prisma.actorRating.findMany({
      where: { actorId },
      select: { rating: true },
    });

    if (ratings.length === 0) return null;

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  // New method to rate an actor
  async rateActor(
    actorId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<ActorRating> {
    // Check if the actor exists
    const actor = await prisma.actor.findUnique({
      where: { id: actorId },
    });

    if (!actor) throw new Error('Actor not found');

    // Create or update the rating (upsert operation)
    return prisma.actorRating.upsert({
      where: {
        userId_actorId: {
          userId,
          actorId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        actorId,
        rating,
        comment,
      },
    });
  }

  // New method to get user's rating for a specific actor
  async getUserRating(
    actorId: string,
    userId: string
  ): Promise<ActorRating | null> {
    return prisma.actorRating.findUnique({
      where: {
        userId_actorId: {
          userId,
          actorId,
        },
      },
    });
  }

  // New method to get all ratings for an actor
  async getActorRatings(actorId: string): Promise<ActorRating[]> {
    return prisma.actorRating.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  // New method to update a rating
  async updateRating(
    id: string,
    userId: string,
    data: { rating?: number; comment?: string }
  ): Promise<ActorRating> {
    // Verify ownership
    const existingRating = await prisma.actorRating.findFirst({
      where: { id, userId },
    });

    if (!existingRating) {
      throw new Error(
        'Rating not found or you do not have permission to update it'
      );
    }

    return prisma.actorRating.update({
      where: { id },
      data: {
        rating: data.rating !== undefined ? data.rating : existingRating.rating,
        comment:
          data.comment !== undefined ? data.comment : existingRating.comment,
      },
    });
  }

  // New method to delete a rating
  async deleteRating(id: string, userId: string): Promise<boolean> {
    // Verify ownership
    const rating = await prisma.actorRating.findFirst({
      where: { id, userId },
    });

    if (!rating) {
      throw new Error(
        'Rating not found or you do not have permission to delete it'
      );
    }

    await prisma.actorRating.delete({ where: { id } });
    return true;
  }

  // New method to configure Actor with AI assistance
  async configureActorWithAI(
    actorId: string,
    url: string,
    prompt: string,
    userId: string
  ): Promise<any> {
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id: actorId, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to update it'
      );
    }

    try {
      // Generate specific URL based on domain and prompt if needed
      let targetUrl = url;

      // Check if we need to generate a URL (if prompt contains URL generation intent)
      if (prompt && prompt.length > 20) {
        try {
          // First try to generate a more specific URL based on the domain and prompt
          const urlPrompt = `Generate a specific URL for ${url} based on this prompt: "${prompt}".
            The URL should include appropriate query parameters, filters, or path segments.
            Return only the full URL with no additional text.`;

          const generatedUrl = await this.deepSeekService.generateUrl(
            url,
            urlPrompt,
            { actorTitle: actor.title }
          );

          // If we got a valid URL, use it instead of the original domain
          if (generatedUrl && generatedUrl.startsWith('http')) {
            targetUrl = generatedUrl;
            console.log(`Generated URL for scraping: ${targetUrl}`);

            // Update the actor with the generated URL
            await prisma.actor.update({
              where: { id: actorId },
              data: {
                url: targetUrl,
              },
            });
          }
        } catch (urlError) {
          console.warn('Error generating specific URL:', urlError);
          // Continue with original URL if generation fails
        }
      }

      // Use PuppeteerService to visit the URL and analyze content
      // Extract key data structures and suggest response filters
      const puppeteerService = new PuppeteerService(redisClient);

      // Get page content using the generated or original URL
      const pageContent = await puppeteerService.getPageContent(targetUrl, {});
      const contentObj = JSON.parse(pageContent);

      // Prepare the prompt for DeepSeek
      const analysisPrompt = `
        Analyze this API response data and help configure an Actor that will scrape similar data:
        
        ${pageContent.substring(0, 8000)}... [truncated for brevity]
        
        Based on the data above and the user prompt: "${prompt}", please:
        
        1. Identify the main data structure and important fields
        2. Suggest the path where the main data array/object is located
        3. List key properties that should be extracted
        4. Recommend filters to deduplicate and clean the data
        5. Provide a script outline for scraping similar data
        
        Format your response as a JSON object with these properties:
        - path: The path to the main data (e.g., "data.results")
        - properties: An array of important property names to keep
        - description: A description of what this data represents
        - scriptOutline: A basic script outline for scraping
      `;

      // Generate an analysis with DeepSeek
      const analysis = await this.deepSeekService.analyzeContent(
        url,
        analysisPrompt,
        { actorTitle: actor.title }
      );

      // Extract key information from the analysis
      const parsedAnalysis =
        typeof analysis === 'string' ? JSON.parse(analysis) : analysis;

      // Generate response filters based on the analysis
      const responseFilters = {
        path: parsedAnalysis.path || '',
        properties: parsedAnalysis.properties || [],
        defaultResult: 20,
      };

      // Extract property options for UI display
      let propertyOptions: string[] = [];

      // Attempt to extract all properties from the first data item
      if (contentObj && contentObj.length > 0) {
        const firstResponse = contentObj[0];
        if (
          firstResponse.data &&
          Array.isArray(firstResponse.data) &&
          firstResponse.data.length > 0
        ) {
          propertyOptions = Object.keys(firstResponse.data[0] || {});
        } else if (
          firstResponse.data &&
          typeof firstResponse.data === 'object'
        ) {
          // Try to find arrays in the data object
          for (const [key, value] of Object.entries(firstResponse.data)) {
            if (Array.isArray(value) && value.length > 0) {
              propertyOptions = Object.keys(value[0] || {});
              break;
            }
          }
        }
      }

      // Update the actor with the AI-generated configuration
      await prisma.actor.update({
        where: { id: actorId },
        data: {
          responseFilters: responseFilters,
          page: {
            script: parsedAnalysis.scriptOutline || '',
            url: url,
          },
        },
      });

      // Return the analysis and property options for the frontend
      return {
        analysis: parsedAnalysis,
        responseFilters,
        propertyOptions,
        rawData: contentObj,
      };
    } catch (error) {
      console.error('Error configuring actor with AI:', error);
      throw new Error(
        `Failed to configure actor with AI: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // New method to test actor scraping
  async testActorScraping(
    actorId: string,
    url: string,
    userId: string
  ): Promise<any> {
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id: actorId, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to test it'
      );
    }

    try {
      // Initialize PuppeteerService
      const puppeteerService = new PuppeteerService(redisClient);

      // Get current response filters from the actor
      const responseFilters = (actor.responseFilters as any) || {};

      // Scrape the URL with current filters
      const pageContent = await puppeteerService.getPageContent(
        url,
        responseFilters
      );

      // Parse the content to extract available properties for filtering
      const contentObj = JSON.parse(pageContent);

      // Extract property options for UI display
      let propertyOptions: string[] = [];
      let sampleData: any = null;

      // Attempt to extract all properties from the first data item
      if (contentObj && contentObj.length > 0) {
        const firstResponse = contentObj[0];
        if (
          firstResponse.data &&
          Array.isArray(firstResponse.data) &&
          firstResponse.data.length > 0
        ) {
          propertyOptions = Object.keys(firstResponse.data[0] || {});
          sampleData = firstResponse.data[0];
        } else if (
          firstResponse.data &&
          typeof firstResponse.data === 'object'
        ) {
          // Try to find arrays in the data object
          for (const [key, value] of Object.entries(firstResponse.data)) {
            if (Array.isArray(value) && value.length > 0) {
              propertyOptions = Object.keys(value[0] || {});
              sampleData = value[0];
              break;
            }
          }
        }
      }

      // Return the test results
      return {
        data: contentObj,
        propertyOptions,
        sampleData,
        currentFilters: responseFilters,
      };
    } catch (error) {
      console.error('Error testing actor scraping:', error);
      throw new Error(
        `Failed to test actor scraping: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // New method to configure response filters
  async configureResponseFilters(
    actorId: string,
    filters: { properties?: string[]; path?: string; defaultResult?: number },
    userId: string
  ): Promise<Actor> {
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id: actorId, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to update it'
      );
    }

    try {
      // Get current response filters from the actor
      const currentFilters = (actor.responseFilters as any) || {};

      // Merge with new filters
      const updatedFilters = {
        path: filters.path || currentFilters.path || '',
        properties: filters.properties || currentFilters.properties || [],
        defaultResult:
          filters.defaultResult || currentFilters.defaultResult || 20,
      };

      // Update the actor with new filters
      return prisma.actor.update({
        where: { id: actorId },
        data: {
          responseFilters: updatedFilters,
        },
      });
    } catch (error) {
      console.error('Error configuring response filters:', error);
      throw new Error(
        `Failed to configure response filters: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
