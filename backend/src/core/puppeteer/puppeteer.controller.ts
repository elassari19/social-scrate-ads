import { Request, Response } from 'express';
import { PuppeteerService } from './puppeteer.service';
import { ActorService } from '../actor/actor.service';

export class PuppeteerController {
  private actorService: ActorService;

  constructor(private puppeteerService: PuppeteerService) {
    // Initialize ActorService with the same PuppeteerService instance
    this.actorService = new ActorService(puppeteerService);
  }

  // Process web content with user-provided prompt using DeepSeek AI
  processWebContentWithDeepSeek = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        url,
        prompt,
        customSelectors,
        fullPageContent,
        actorNamespace,
        additionalContext,
      } = req.body;
      const userId = req.user?.id;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // Log the user's request
      console.log(
        `User ${userId} requested web content analysis with DeepSeek AI`
      );

      // If actorNamespace is provided, use the actor-based flow
      if (actorNamespace) {
        try {
          // Use the actor service to handle the request
          const result = await this.actorService.executeActorWithDeepSeek(
            actorNamespace,
            {
              userPrompt: prompt,
              ...additionalContext,
              userId,
            }
          );

          res.json(result);
          return;
        } catch (error) {
          console.error('Actor-based scraping error:', error);
          res.status(500).json({
            error: 'Failed to process web content with actor',
            message: error instanceof Error ? error.message : String(error),
          });
          return;
        }
      }

      // If URL is provided, use the direct web content processing
      if (url) {
        // Process web content with DeepSeek AI
        const result =
          await this.puppeteerService.processWebContentWithDeepSeek(
            url,
            prompt,
            {
              customSelectors,
              fullPageContent,
              additionalContext: {
                ...additionalContext,
                userId,
              },
            }
          );

        res.json({
          url,
          result,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // If neither actorNamespace nor URL is provided, generate URL from DeepSeek
      const { url: generatedUrl, selectors } =
        await this.puppeteerService.generateUrlAndSelectors(
          'generic', // Default actor type
          prompt,
          additionalContext
        );

      // Now use the generated URL to scrape and analyze
      const result = await this.puppeteerService.processWebContentWithDeepSeek(
        generatedUrl,
        prompt,
        {
          customSelectors: selectors,
          additionalContext: {
            ...additionalContext,
            userId,
            generatedUrl: true,
          },
        }
      );

      res.json({
        url: generatedUrl,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Web content processing error:', error);

      res.status(500).json({
        error: 'Failed to process web content with DeepSeek AI',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // New endpoint to analyze actor ratings using DeepSeek AI
  analyzeActorRatings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actorId, prompt, additionalContext } = req.body;
      const userId = req.user?.id;

      if (!actorId) {
        res.status(400).json({ error: 'Actor ID is required' });
        return;
      }

      // Use the enhanced prompt or a default one
      const analysisPrompt =
        prompt ||
        "Analyze these ratings and provide insights about the actor's performance, common themes in feedback, and suggestions for improvement.";

      // Log the request
      console.log(
        `User ${userId} requested actor ratings analysis for actor ${actorId}`
      );

      // Process the ratings with DeepSeek
      const result = await this.puppeteerService.processRatingsWithDeepSeek(
        actorId,
        analysisPrompt,
        {
          ...additionalContext,
          userId,
        }
      );

      res.json({
        actorId,
        analysis: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Rating analysis error:', error);

      res.status(500).json({
        error: 'Failed to analyze actor ratings with DeepSeek AI',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
