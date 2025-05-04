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

  // Execute actor with web content processing via DeepSeek
  async executeActorWithDeepSeek(
    actorIdentifier: string,
    context: Record<string, any>
  ): Promise<any> {
    console.log('Executing actor with DeepSeek:', actorIdentifier, context);

    // First try to find the actor by ID
    let actor = await prisma.actor.findUnique({
      where: { id: actorIdentifier },
    });

    // If not found by ID, try to find by namespace
    if (!actor) {
      actor = await this.getActorByNamespace(actorIdentifier);

      if (!actor) {
        throw new Error(
          `Actor with ID or namespace "${actorIdentifier}" not found`
        );
      }
    }

    console.log('Found actor:', actor.title, actor.namespace, actor.id);

    // Create an execution record
    const execution = await prisma.actorExecution.create({
      data: {
        status: 'pending',
        actorId: actor.id,
      },
    });

    try {
      // Update status to running
      await prisma.actorExecution.update({
        where: { id: execution.id },
        data: { status: 'running' },
      });

      // Get the prompt from the user context
      const prompt = context.userPrompt;

      if (!prompt) {
        throw new Error('A prompt is required to process the web content');
      }

      // STEP 1: Generate URL and Puppeteer script from DeepSeek based on actor type and prompt
      const { url, script, selectors, pagination } =
        await this.puppeteerService.generateUrlAndScript(
          actor.namespace, // Using namespace as actor type (e.g., "linkedin", "facebook")
          prompt,
          context
        );

      console.log(`Generated URL for ${actor.namespace}: ${url}`);

      return {
        url,
        executionId: execution.id,
      };
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
}
