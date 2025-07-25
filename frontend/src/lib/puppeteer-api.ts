interface ScrapeParams {
  url: string;
  selectors: Record<string, string>;
}

interface SocialMediaAdsParams {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  query?: string;
}

interface DeepSeekScrapeParams {
  actorNamespace: string;
  location?: string;
  jobs?: string[];
  posts?: string[];
  additionalContext?: Record<string, any>;
}

interface WebContentDeepSeekParams {
  url: string;
  prompt: string;
  customSelectors?: Record<string, string>;
  fullPageContent?: boolean;
  additionalContext?: Record<string, any>;
}

interface ActorDeepSeekParams {
  actorNamespace: string;
  url?: string;
  prompt?: string;
  location?: string;
  jobs?: string[];
  posts?: string[];
  additionalContext?: Record<string, any>;
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

  /**
   * Use DeepSeek AI to scrape data based on actor script
   */
  async scrapeWithDeepSeekAI(params: DeepSeekScrapeParams): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/puppeteer/deepseek-scrape`,
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
        throw new Error(error.error || 'Failed to process with DeepSeek AI');
      }

      return await response.json();
    } catch (error) {
      console.error('DeepSeek AI scraping error:', error);
      throw error;
    }
  },

  /**
   * Process web content with DeepSeek AI
   */
  async processWebContentWithDeepSeek(
    params: WebContentDeepSeekParams
  ): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/puppeteer/process-web-content`,
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
        throw new Error(
          error.error || 'Failed to process web content with DeepSeek AI'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Web content processing error:', error);
      throw error;
    }
  },

  /**
   * Execute an actor with DeepSeek AI
   */
  async executeActorWithDeepSeek(params: ActorDeepSeekParams): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/actors/${params.actorNamespace}/deepseek`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            url: params.url,
            prompt: params.prompt,
            location: params.location,
            jobs: params.jobs,
            posts: params.posts,
            additionalContext: params.additionalContext,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Failed to execute actor with DeepSeek AI'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Actor DeepSeek execution error:', error);
      throw error;
    }
  },

  /**
   * Select a specific response from puppeteer navigation to save in actor configuration
   */
  async selectResponse(params: {
    actorId: string;
    responseId: string;
    properties?: string[];
    dataPath?: string;
    defaultResult?: number;
  }): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/puppeteer/select-response`,
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
        throw new Error(error.error || 'Failed to select response');
      }

      return await response.json();
    } catch (error) {
      console.error('Response selection error:', error);
      throw error;
    }
  },
};
