import { Page } from 'puppeteer-core';
import { Redis } from 'ioredis';
import { browserManager, BrowserManager } from './browser.config';
import { createDeepSeekService, DeepSeekService } from '../../lib/deepseek';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PuppeteerService {
  private browserManager: BrowserManager;
  private deepSeekService: DeepSeekService;

  constructor(
    private redis: Redis,
    deepSeekApiKey?: string,
    customBrowserManager?: BrowserManager
  ) {
    this.browserManager = customBrowserManager || browserManager;
    this.deepSeekService = createDeepSeekService(
      process.env.DEEPSEEK_API_KEY,
      redis
    );
  }

  async createPage(): Promise<Page> {
    return this.browserManager.createPage();
  }

  async closeBrowser(): Promise<void> {
    return this.browserManager.closeBrowser();
  }

  // Method to extract GraphQL API responses with filtering and deduplication
  async getPageContent(url: string, context: any): Promise<string> {
    const page = await this.createPage();
    let graphqlResponses: any[] = [];
    let responseMap = new Map(); // For deduplication based on keys
    let responseCounter = 0; // Counter for assigning unique IDs to responses

    try {
      // Set up response interception
      await page.setRequestInterception(true);

      // Only intercept responses from API endpoints
      page.on('response', async (response) => {
        const responseUrl = response.url();
        const request = response.request();

        // Match the endpoint path if provided in context
        const shouldIntercept = context.path
          ? responseUrl.includes(context.path)
          : responseUrl.includes('/graphql') || responseUrl.includes('/api');

        // Only process POST requests to API endpoints
        if (
          (request.method() === 'POST' || request.method() === 'GET') &&
          shouldIntercept
        ) {
          try {
            const responseText = await response.text();
            let responseData: any;

            try {
              // Try to parse as JSON
              responseData = JSON.parse(responseText);

              // Add unique ID and source URL to each response
              responseCounter++;
              responseData._responseId = `resp_${responseCounter}`;
              responseData._responseUrl = responseUrl;
              responseData._requestMethod = request.method();
              responseData._timestamp = new Date().toISOString();

              // Deduplicate based on property keys
              if (responseData) {
                // For each response item (if it's an array)
                if (Array.isArray(responseData.data)) {
                  responseData.data.forEach((item: any) => {
                    // Create a unique key based on object properties
                    const itemKeys = Object.keys(item).sort().join('|');
                    // Only add this item if we haven't seen these exact keys before
                    if (!responseMap.has(itemKeys)) {
                      responseMap.set(itemKeys, item);
                    }
                  });
                } else if (
                  responseData.data &&
                  typeof responseData.data === 'object'
                ) {
                  // Handle case where data is an object containing arrays
                  Object.entries(responseData.data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                      // @ts-ignore
                      responseData.data[key] = this.deduplicateByKeys(value);
                    }
                  });
                  graphqlResponses.push(responseData);
                } else {
                  // Just add the whole response if not in expected format
                  graphqlResponses.push(responseData);
                }
              }
            } catch (parseError) {
              // If it's not valid JSON, just add the text response
              console.warn('Response is not valid JSON:', parseError);
              responseCounter++;
              graphqlResponses.push({
                rawText: responseText,
                _responseId: `resp_${responseCounter}`,
                _responseUrl: responseUrl,
                _requestMethod: request.method(),
                _timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.warn('Error getting API response:', error);
          }
        }
      });

      // Continue all requests
      page.on('request', (request) => {
        request.continue();
      });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for additional time to capture more responses
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Add all deduplicated items to the responses
      if (responseMap.size > 0) {
        responseCounter++;
        graphqlResponses.push({
          data: Array.from(responseMap.values()),
          _responseId: `resp_${responseCounter}`,
          _info: 'These results were deduplicated based on property keys',
          _timestamp: new Date().toISOString(),
        });
      }

      // If we need to select a specific response based on stored filter
      if (context.selectedResponseId) {
        // Find and prioritize the previously selected response
        const selectedResponse = graphqlResponses.find(
          (response) => response._responseId === context.selectedResponseId
        );

        if (selectedResponse) {
          // Move the selected response to the front of the array
          graphqlResponses = [
            selectedResponse,
            ...graphqlResponses.filter(
              (r) => r._responseId !== context.selectedResponseId
            ),
          ];
        }
      }

      // Apply any additional filtering from context
      if (
        context.properties &&
        Array.isArray(context.properties) &&
        context.properties.length > 0
      ) {
        graphqlResponses = this.filterResponsesByProperties(
          graphqlResponses,
          context.properties
        );
      }

      // Limit results if specified
      const maxResults = context.maxResult || 1000;
      graphqlResponses = this.limitResults(graphqlResponses, maxResults);

      // Add metadata about response selection
      return JSON.stringify({
        responses: graphqlResponses,
        metadata: {
          totalResponses: graphqlResponses.length,
          url: url,
          timestamp: new Date().toISOString(),
          selectedResponseId: context.selectedResponseId || null,
        },
      });
    } catch (error) {
      console.error('Error capturing API responses:', error);
      throw new Error(
        `Failed to capture API responses: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      // Disable request interception before closing
      await page.setRequestInterception(false);
      await this.closeBrowser();
    }
  }

  // Helper method to deduplicate array items based on their keys
  private deduplicateByKeys(items: any[]): any[] {
    const uniqueMap = new Map();

    items.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        const itemKeys = Object.keys(item).sort().join('|');
        if (!uniqueMap.has(itemKeys)) {
          uniqueMap.set(itemKeys, item);
        }
      } else {
        // For primitive values, use the value itself as the key
        if (!uniqueMap.has(String(item))) {
          uniqueMap.set(String(item), item);
        }
      }
    });

    return Array.from(uniqueMap.values());
  }

  // Helper method to filter responses by specific properties
  private filterResponsesByProperties(
    responses: any[],
    properties: string[]
  ): any[] {
    return responses.map((response) => {
      // Skip if not an object or null
      if (typeof response !== 'object' || response === null) {
        return response;
      }

      // Handle array of data
      if (Array.isArray(response)) {
        return response.map((item) =>
          this.filterObjectByProperties(item, properties)
        );
      }

      // Handle data property that's an array
      if (response.data && Array.isArray(response.data)) {
        return {
          ...response,
          data: response.data.map((item: any) =>
            this.filterObjectByProperties(item, properties)
          ),
        };
      }

      // Handle data property that's an object
      if (response.data && typeof response.data === 'object') {
        const filteredData: any = {};
        Object.entries(response.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // @ts-ignore
            filteredData[key] = value.map((item) =>
              this.filterObjectByProperties(item, properties)
            );
          } else {
            // @ts-ignore
            filteredData[key] = this.filterObjectByProperties(
              value,
              properties
            );
          }
        });
        return { ...response, data: filteredData };
      }

      // If nothing else matches, filter the response object itself
      return this.filterObjectByProperties(response, properties);
    });
  }

  // Helper to filter an individual object by properties
  private filterObjectByProperties(obj: any, properties: string[]): any {
    // If not an object or null, return as is
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    // Filter object to keep only specified properties
    const filtered: any = {};
    properties.forEach((prop) => {
      if (prop in obj) {
        filtered[prop] = obj[prop];
      }
    });

    return filtered;
  }

  // Helper to limit the number of results
  private limitResults(responses: any[], maxResults: number): any[] {
    return responses.map((response) => {
      // Skip if not an object or null
      if (typeof response !== 'object' || response === null) {
        return response;
      }

      // Handle array
      if (Array.isArray(response)) {
        return response.slice(0, maxResults);
      }

      // Handle data property that's an array
      if (response.data && Array.isArray(response.data)) {
        return {
          ...response,
          data: response.data.slice(0, maxResults),
        };
      }

      // Handle data property with nested arrays
      if (response.data && typeof response.data === 'object') {
        const limitedData: any = { ...response.data };
        Object.entries(limitedData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // @ts-ignore
            limitedData[key] = value.slice(0, maxResults);
          }
        });
        return { ...response, data: limitedData };
      }

      return response;
    });
  }

  /**
   * Generate a Puppeteer script for a specific URL based on a prompt
   */
  async parseContent(
    id: string,
    url: string,
    prompt: string,
    namespace: string,
    context: any
  ): Promise<{
    script: string;
    selectors?: Record<string, string>;
    pagination?: { nextPageSelector?: string; maxPages: number };
  }> {
    const actor = await prisma.actor.findFirst({
      where: { id },
    });

    if (!actor) {
      throw new Error(`Actor with ID ${id} not found`);
    }
    const pageContent = await this.getPageContent(url, {
      ...(actor.responseFilters as {}),
      maxResult: context.maxResult,
    });
    console.log('Page content:', pageContent);
    return {
      script: pageContent,
      selectors: {},
      pagination: { nextPageSelector: '', maxPages: 1 },
    };
    // Create a specific prompt for script generation
    const scriptGenerationPrompt = `
      Generate a comprehensive Puppeteer script that will scrape data from the URL: ${url}
      
      The script should:
      1. Navigate to the URL: ${url}
      2. Wait for the main content to fully load
      3. Get the content after successful navigation
      4. Parse the content following this specific user prompt: "${prompt}"
      5. Extract data based on appropriate selectors
      6. Handle pagination if needed
      7. Store all extracted data in a 'data' object
      8. Handle potential errors gracefully
      
      Return a JSON object with:
      - script: The complete Puppeteer script that follows these instructions
      - selectors: CSS selectors for key elements to be extracted
      - pagination: Information about handling pagination if relevant
    `;

    try {
      // Check if deepSeekService is initialized
      if (!this.deepSeekService) {
        throw new Error('DeepSeek service is not initialized');
      }

      // Use DeepSeek to generate the script
      const result = await this.deepSeekService.parseContent(
        url,
        scriptGenerationPrompt,
        {}
      );

      console.log('Generated script:', result);

      // Return the generated script data
      return {
        script: result.script || result.text || JSON.stringify(result, null, 2),
        selectors: result.selectors || {},
        pagination: result.pagination || { maxPages: 1 },
      };
    } catch (error) {
      console.error('Error generating Puppeteer script:', error);
      throw new Error(
        `Failed to generate Puppeteer script: ${
          error instanceof Error ? error : String(error)
        }`
      );
    }
  }
}
