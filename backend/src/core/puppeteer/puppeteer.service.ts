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

  // Helper method to generate content from DeepSeek AI
  private async generateFromDeepSeek<T>(
    actorType: string,
    prompt: string,
    specializiedPrompt: string,
    additionalContext?: Record<string, any>
  ): Promise<T> {
    if (!this.deepSeekApiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    // Create context for DeepSeek API
    const context = {
      actorType,
      prompt,
      ...additionalContext,
    };

    // Call DeepSeek API
    const result = await this.callDeepSeekAPI(specializiedPrompt, context);
    return result as T;
  }

  // Generate URL and selectors from DeepSeek
  async generateUrlAndSelectors(
    actorType: string,
    prompt: string,
    additionalContext?: Record<string, any>
  ): Promise<{
    url: string;
    selectors: Record<string, string>;
    pagination?: { nextPageSelector?: string; maxPages: number };
  }> {
    // Specialized prompt for DeepSeek to generate URL and selectors
    const specializiedPrompt = `
      Based on the actor type "${actorType}" and user prompt "${prompt}", 
      generate a URL to scrape and a set of CSS selectors to extract relevant data.
      
      Instructions:
      1. Analyze the user's prompt and determine what data needs to be extracted
      2. Create a valid URL for the ${actorType} platform that would contain this data
      3. Define CSS selectors that can extract the required information

      Return ONLY a JSON object with the following structure:
      {
        "url": "full URL to navigate to",
        "selectors": {
          "key1": "selector1",
          "key2": "selector2",
          // Add as many selectors as needed
        },
        "pagination": {
          "nextPageSelector": "selector for next page button if applicable",
          "maxPages": number of pages to scrape (default: 1)
        }
      }
    `;

    const result = await this.generateFromDeepSeek<{
      url: string;
      selectors: Record<string, string>;
      pagination?: { nextPageSelector?: string; maxPages: number };
    }>(actorType, prompt, specializiedPrompt, additionalContext);

    // Validate the response
    if (!result.url || !result.selectors) {
      throw new Error('DeepSeek failed to generate valid URL and selectors');
    }

    return {
      url: result.url,
      selectors: result.selectors,
      pagination: result.pagination || { maxPages: 1 },
    };
  }

  // Generate URL and puppeteer script from DeepSeek
  async generateUrlAndScript(
    actorType: string,
    prompt: string,
    additionalContext?: Record<string, any>
  ): Promise<{
    url: string;
    script: string;
    selectors: Record<string, string>;
    pagination?: any;
  }> {
    // Specialized prompt for DeepSeek to generate URL and puppeteer script
    const specializiedPrompt = `
      Based on the actor type "${actorType}" (e.g., LinkedIn, Facebook, Twitter, etc.) and user prompt "${prompt}", 
      generate a URL to scrape and a Puppeteer script to extract relevant data.
      
      Instructions:
      1. Analyze the user's prompt to determine what data needs to be extracted
      2. Create a valid URL for the ${actorType} platform that would contain this data
      3. Define CSS selectors that can extract the required information
      4. Create a script that ONLY contains selectors and pagination logic (no browser initialization or other configuration)
      
      Return ONLY a JSON object with the following structure:
      {
        "url": "full URL to navigate to",
        "selectors": {
          "key1": "selector1",
          "key2": "selector2",
          // Add as many selectors as needed
        },
        "pagination": {
          "nextPageSelector": "selector for next page button if applicable",
          "maxPages": number of pages to scrape (default: 1)
        },
        "script": "// Puppeteer script that uses page object to scrape data\\nconst data = {};\\n// Define selectors and extraction logic here\\n// Example: data.titles = await page.$$eval('.title', els => els.map(el => el.textContent.trim()));"
      }
    `;

    const result = await this.generateFromDeepSeek<{
      url: string;
      script: string;
      selectors: Record<string, string>;
      pagination?: { nextPageSelector?: string; maxPages: number };
    }>(actorType, prompt, specializiedPrompt, additionalContext);

    // Validate the response
    if (!result.url || !result.script || !result.selectors) {
      throw new Error(
        'DeepSeek failed to generate valid URL and scraping script'
      );
    }

    return {
      url: result.url,
      script: result.script,
      selectors: result.selectors,
      pagination: result.pagination || { maxPages: 1 },
    };
  }

  // Process actor with rating information
  async processRatingsWithDeepSeek(
    actorId: string,
    prompt: string = 'Analyze the ratings and provide insights',
    additionalContext?: Record<string, any>
  ): Promise<any> {
    if (!this.deepSeekApiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    try {
      // Fetch actor with ratings
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const actor = await prisma.actor.findUnique({
        where: { id: actorId },
        include: {
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!actor) {
        throw new Error('Actor not found');
      }

      // Calculate average rating
      let averageRating = null;
      if (actor.ratings.length > 0) {
        const sum = actor.ratings.reduce(
          (acc: number, rating: any) => acc + rating.rating,
          0
        );
        averageRating = sum / actor.ratings.length;
      }

      // Prepare context with rating data
      const context = {
        actor: {
          id: actor.id,
          title: actor.title,
          description: actor.description,
          namespace: actor.namespace,
          averageRating,
        },
        ratings: actor.ratings.map((r: any) => ({
          rating: r.rating,
          comment: r.comment,
          userName: r.user.name,
          createdAt: r.createdAt,
        })),
        ...additionalContext,
      };

      // Call DeepSeek API with the prompt and context
      const result = await this.callDeepSeekAPI(prompt, context);
      return result;
    } catch (error) {
      console.error('Rating analysis error:', error);
      throw new Error(
        `Failed to process ratings: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
