import { Request, Response } from 'express';
import { PuppeteerService } from './puppeteer.service';

export class PuppeteerController {
  constructor(private puppeteerService: PuppeteerService) {}

  // Scrape content from a webpage
  scrapeContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, selectors } = req.body;

      if (!url || !selectors) {
        res.status(400).json({ error: 'URL and selectors are required' });
        return;
      }

      const content = await this.puppeteerService.scrapeContent(url, selectors);
      res.json(content);
    } catch (error) {
      console.error('Scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape content' });
    }
  };

  // Scrape social media ads (example specialized method)
  scrapeSocialMediaAds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { platform, query } = req.body;

      if (!platform) {
        res.status(400).json({ error: 'Platform is required' });
        return;
      }

      // Different selectors for different platforms
      let url: string;
      let selectors: Record<string, string>;

      switch (platform.toLowerCase()) {
        case 'facebook':
          url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(
            query || ''
          )}`;
          selectors = {
            adCount: '.x1xmf6yo',
            adTexts: '.x1ywc1zp',
          };
          break;
        case 'linkedin':
          url = `https://www.linkedin.com/ads/search?keywords=${encodeURIComponent(
            query || ''
          )}`;
          selectors = {
            adCount: '.artdeco-pagination__indicator--number',
            adItems: '.feed-shared-update-v2',
          };
          break;
        case 'twitter':
          url = `https://ads.twitter.com/transparency/search?q=${encodeURIComponent(
            query || ''
          )}`;
          selectors = {
            adCount: '.AdTransparency-count',
            adItems: '.AdTransparency-item',
          };
          break;
        default:
          res.status(400).json({ error: 'Unsupported platform' });
          return;
      }

      const content = await this.puppeteerService.scrapeContent(url, selectors);
      res.json({
        platform,
        query,
        data: content,
      });
    } catch (error) {
      console.error('Social media scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape social media ads' });
    }
  };
}
