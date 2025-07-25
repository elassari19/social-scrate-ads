import { Request, Response } from 'express';
import { PuppeteerService } from './puppeteer.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PuppeteerController {
  constructor(private puppeteerService: PuppeteerService) {
    this.puppeteerService = puppeteerService;
  }

  // Generate puppeteer script for a specific URL
  gerUrlContent = async (req: Request, res: Response): Promise<void> => {
    console.log('Generating puppeteer script...');
    try {
      const { id, url, prompt, actorNamespace, additionalContext } = req.body;
      const userId = req.user?.id;

      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      console.log(
        `Getting URL content for url: ${url}, actor: ${actorNamespace}`
      );

      // Use DeepSeek to generate the puppeteer script
      const scriptResult = await this.puppeteerService.parseContent(
        id,
        url,
        prompt,
        actorNamespace,
        additionalContext
      );

      res.json(scriptResult);
    } catch (error) {
      console.error('Error generating puppeteer script:', error);

      res.status(500).json({
        error: 'Failed to generate puppeteer script',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Select a specific response from puppeteer navigation to save in actor configuration
  selectResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actorId, responseId, properties } = req.body;
      const userId = req.user?.id;

      if (!actorId) {
        res.status(400).json({ error: 'Actor ID is required' });
        return;
      }

      if (!responseId) {
        res.status(400).json({ error: 'Response ID is required' });
        return;
      }

      console.log(`Selecting response ${responseId} for actor ${actorId}`);

      // Verify actor exists and belongs to the user
      const actor = await prisma.actor.findFirst({
        where: {
          id: actorId,
          userId: userId,
        },
      });

      if (!actor) {
        res.status(404).json({ error: 'Actor not found or access denied' });
        return;
      }

      // Update the actor's responseFilters with the selected response ID
      const updatedActor = await prisma.actor.update({
        where: { id: actorId },
        data: {
          responseFilters: {
            selectedResponseId: responseId,
            properties: properties || [],
            ...((actor.responseFilters as object) || {}),
          },
        },
      });

      res.json({
        success: true,
        message: 'Response selection saved successfully',
        actor: {
          id: updatedActor.id,
          title: updatedActor.title,
          responseFilters: updatedActor.responseFilters,
        },
      });
    } catch (error) {
      console.error('Error selecting response:', error);
      res.status(500).json({
        error: 'Failed to save response selection',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
