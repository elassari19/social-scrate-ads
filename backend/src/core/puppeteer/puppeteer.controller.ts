import { Request, Response } from 'express';
import { PuppeteerService } from './puppeteer.service';

export class PuppeteerController {
  constructor(private puppeteerService: PuppeteerService) {}

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
        additionalContext,
      } = req.body;
      const userId = req.user?.id;

      if (!url || !prompt) {
        res.status(400).json({ error: 'URL and prompt are required' });
        return;
      }

      // Log the user's request
      console.log(
        `User ${userId} requested web content analysis with DeepSeek AI: ${url}`
      );

      // Process web content with DeepSeek AI
      const result = await this.puppeteerService.processWebContentWithDeepSeek(
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
    } catch (error) {
      console.error('Web content processing error:', error);

      res.status(500).json({
        error: 'Failed to process web content with DeepSeek AI',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
