import { Page } from 'puppeteer-core';
import { Redis } from 'ioredis';
import { browserManager, BrowserManager } from './browser.config';

export class PuppeteerService {
  private deepSeekApiKey: string;
  private browserManager: BrowserManager;

  constructor(
    private redis: Redis,
    deepSeekApiKey?: string,
    customBrowserManager?: BrowserManager
  ) {
    this.deepSeekApiKey = deepSeekApiKey || process.env.DEEPSEEK_API_KEY || '';
    this.browserManager = customBrowserManager || browserManager;
  }

  async createPage(): Promise<Page> {
    return this.browserManager.createPage();
  }

  async closeBrowser(): Promise<void> {
    return this.browserManager.closeBrowser();
  }

  // Basic scraping method - needed for custom selectors
  async scrapeContent(
    url: string,
    selectors: Record<string, string>
  ): Promise<Record<string, string>> {
    const page = await this.createPage();
    const result: Record<string, string> = {};

    try {
      // Check cache first
      const cacheKey = `scrape:${url}:${JSON.stringify(selectors)}`;
      const cachedResult = await this.redis.get(cacheKey);

      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Extract data based on provided selectors
      for (const [key, selector] of Object.entries(selectors)) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          result[key] = await page.$eval(
            selector,
            (el) => el.textContent?.trim() || ''
          );
        } catch (error) {
          result[key] = '';
        }
      }

      // Cache the result for 1 hour
      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);

      return result;
    } finally {
      await page.close();
    }
  }

  // Method to extract full page content
  async getPageContent(url: string): Promise<string> {
    const page = await this.createPage();

    try {
      // Check cache first
      const cacheKey = `page-content:${url}`;
      const cachedContent = await this.redis.get(cacheKey);

      if (cachedContent) {
        return cachedContent;
      }

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extract the full page text content
      const content = await page.evaluate(() => {
        // Remove script and style elements to get only visible text
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach((s) => s.remove());

        return document.body.innerText;
      });

      // Cache the content for 30 minutes
      await this.redis.set(cacheKey, content, 'EX', 1800);

      return content;
    } finally {
      await page.close();
    }
  }

  // Method to process web content with DeepSeek AI - our main functionality
  async processWebContentWithDeepSeek(
    url: string,
    prompt: string,
    options: {
      customSelectors?: Record<string, string>;
      fullPageContent?: boolean;
      additionalContext?: Record<string, any>;
    } = {}
  ): Promise<any> {
    if (!this.deepSeekApiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    try {
      // Get web content based on options
      let webContent: string | Record<string, string>;

      if (options.fullPageContent) {
        // Get full page content
        webContent = await this.getPageContent(url);
      } else if (
        options.customSelectors &&
        Object.keys(options.customSelectors).length > 0
      ) {
        // Get content based on provided selectors
        webContent = await this.scrapeContent(url, options.customSelectors);
      } else {
        // Default: get full page content
        webContent = await this.getPageContent(url);
      }

      // Prepare context with web content and additional context
      const context = {
        url,
        webContent,
        ...options.additionalContext,
      };

      // Call DeepSeek API with the prompt and context
      return this.callDeepSeekAPI(prompt, context);
    } catch (error) {
      console.error('Web content processing error:', error);
      throw new Error(
        `Failed to process web content: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Centralized method to call DeepSeek API
  private async callDeepSeekAPI(
    prompt: string,
    context: Record<string, any>
  ): Promise<any> {
    // Cache key based on the prompt and context
    const cacheKey = `deepseek:${Buffer.from(
      JSON.stringify({ prompt, context })
    ).toString('base64')}`;

    // Check cache first
    const cachedResult = await this.redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // Call DeepSeek API
    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.deepSeekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert web scraper assistant. Extract and organize the requested information accurately.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 5000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();
    const result = responseData.choices[0].message.content;

    // Try to parse the result as JSON if possible
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      // If not valid JSON, use the text as is
      parsedResult = { text: result };
    }

    // Cache the result for 30 minutes
    await this.redis.set(cacheKey, JSON.stringify(parsedResult), 'EX', 1800);

    return parsedResult;
  }
}
