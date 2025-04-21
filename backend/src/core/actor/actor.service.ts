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
    return prisma.actor.create({
      data: {
        ...actorData,
        script: JSON.parse(JSON.stringify(actorData.script)),
        userId,
      },
    });
  }

  async updateActor(
    id: string,
    actorData: Partial<Actor>,
    userId: string
  ): Promise<Actor> {
    console.log('id', id, 'userId', userId);
    // First verify the actor belongs to the user
    const actor = await prisma.actor.findFirst({
      where: { id, userId },
    });

    if (!actor) {
      throw new Error(
        'Actor not found or you do not have permission to update it'
      );
    }

    return prisma.actor.update({
      where: { id },
      data: {
        ...actorData,
        script: JSON.parse(JSON.stringify(actorData.script)),
      },
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
    url?: string,
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

      // Execute the script using the puppeteer service
      // We're evaluating the script string as JavaScript
      // This requires careful validation and security measures in a production environment

      // Create a new browser page
      const page = await this.puppeteerService.createPage();

      try {
        // If URL is provided, navigate to it
        if (url) {
          await page.goto(url, { waitUntil: 'domcontentloaded' });
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

  async getActorExecutions(actorId: string, limit = 10): Promise<any[]> {
    return prisma.actorExecution.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
