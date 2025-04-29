import { Actor, PrismaClient, Prisma, ActorRating } from '@prisma/client';
import { PuppeteerService } from '../puppeteer/puppeteer.service';

const prisma = new PrismaClient();

export class ActorService {
  constructor(private puppeteerService: PuppeteerService) {}

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
        namespace: actorData.namespace,
        description: actorData.description,
        authorName: actorData.authorName,
        icon: actorData.icon,
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

  async executeActor(
    actorId: string,
    options?: Record<string, any>
  ): Promise<any> {
    // Create an execution record
    const actor = await prisma.actor.findUnique({
      where: { id: actorId },
    });

    if (!actor) {
      throw new Error('Actor not found');
    }

    const execution = await prisma.actorExecution.create({
      data: {
        status: 'pending',
        actorId,
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
    namespace: string,
    context: Record<string, any>
  ): Promise<any> {
    // Get the actor by namespace
    const actor = await this.getActorByNamespace(namespace);

    if (!actor) {
      throw new Error(`Actor with namespace "${namespace}" not found`);
    }

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
      console.log(
        `Generated script for ${actor.namespace}: ${script.substring(
          0,
          100
        )}...`
      );

      // STEP 2: Use Puppeteer to navigate to the URL and execute the generated script
      const page = await this.puppeteerService.createPage();
      let scrapedData: Record<string, any> = {};

      try {
        // Navigate to the generated URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Execute the script with pagination support
        scrapedData = await this.executeScriptWithPagination(
          page,
          script,
          pagination
        );
      } finally {
        // Always close the page
        await page.close();
      }

      // STEP 3: Process the scraped content with DeepSeek AI using the user's original prompt
      const result = await this.puppeteerService.processWebContentWithDeepSeek(
        url,
        prompt,
        {
          additionalContext: {
            ...context,
            scrapedContent: scrapedData,
            originalUrl: url,
            selectors,
          },
        }
      );

      // Update execution record with results
      const completedExecution = await prisma.actorExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          endTime: new Date(),
          results: result || {},
        },
      });

      return {
        actor: {
          id: actor.id,
          name: actor.title,
          namespace: actor.namespace,
          url, // Return the generated URL, not the actor.url
        },
        executionId: execution.id,
        context,
        scrapedData,
        selectors,
        generatedScript: script,
        result,
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

  async getActorExecutions(actorId: string, limit = 10): Promise<any[]> {
    return prisma.actorExecution.findMany({
      where: { actorId },
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
