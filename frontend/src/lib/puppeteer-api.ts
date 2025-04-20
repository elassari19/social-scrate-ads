interface ScrapeParams {
  url: string;
  selectors: Record<string, string>;
}

interface SocialMediaAdsParams {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  query?: string;
}

export const puppeteerApi = {
  /**
   * Scrape content from a webpage
   */
  async scrapeContent(params: ScrapeParams): Promise<Record<string, string>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/puppeteer/scrape`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape content');
      }

      return await response.json();
    } catch (error) {
      console.error('Scrape content error:', error);
      throw error;
    }
  },

  /**
   * Scrape social media ads
   */
  async scrapeSocialMediaAds(params: SocialMediaAdsParams): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/puppeteer/social-ads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape social media ads');
      }

      return await response.json();
    } catch (error) {
      console.error('Social media ads scraping error:', error);
      throw error;
    }
  },
};
