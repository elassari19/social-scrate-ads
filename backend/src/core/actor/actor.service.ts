import { Actor, PrismaClient } from '@prisma/client';
import { PuppeteerService } from '../puppeteer/puppeteer.service';

const prisma = new PrismaClient();

export class ActorService {
  constructor(private puppeteerService: PuppeteerService) {}

  async getAllActors(userId?: string): Promise<Actor[]> {
    return prisma.actor.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
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
    const script = actorData.script || {};

    // Ensure tags is an array
    const tags = Array.isArray(actorData.tags) ? actorData.tags : [];

    return prisma.actor.create({
      data: {
        title: actorData.title,
        namespace: actorData.namespace,
        description: actorData.description,
        stars: actorData.stars,
        rating: actorData.rating,
        authorName: actorData.authorName,
        authorBadgeColor: actorData.authorBadgeColor,
        icon: actorData.icon,
        iconBg: actorData.iconBg,
        url: actorData.url,
        tags,
        script: JSON.parse(JSON.stringify(script)),
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
    if (actorData.script) {
      updateData.script = JSON.parse(JSON.stringify(actorData.script));
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
        // Navigate to the actor's predefined URL
        if (actor.url) {
          await page.goto(actor.url, { waitUntil: 'domcontentloaded' });
        }

        // Execute the script
        // We're wrapping the user script in an async function
        const scriptFunction = new Function(
          'page',
          'options',
          `
          return (async () => {
            try {
              ${actor.script}
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

      // Get the URL from the actor model
      const url = actor.url;

      if (!url) {
        throw new Error(`Actor "${namespace}" does not have a URL configured`);
      }

      // Get the prompt from the user context
      const prompt = context.userPrompt;

      if (!prompt) {
        throw new Error('A prompt is required to process the web content');
      }

      // Process with DeepSeek AI using the actor's URL
      const result = await this.puppeteerService.processWebContentWithDeepSeek(
        url,
        prompt,
        {
          additionalContext: context,
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
          url: actor.url,
        },
        executionId: execution.id,
        context,
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

  async getActorExecutions(actorId: string, limit = 10): Promise<any[]> {
    return prisma.actorExecution.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
