import puppeteer, { Browser, Page } from 'puppeteer-core';
import { Redis } from 'ioredis';

export class PuppeteerService {
  private browser: Browser | null = null;
  private chromePath: string;

  constructor(private redis: Redis, chromePath?: string) {
    // Default Chrome paths based on operating system
    // Users can also provide a custom path
    this.chromePath = chromePath || this.getDefaultChromePath();
  }

  private getDefaultChromePath(): string {
    // Default Chrome paths for different operating systems
    switch (process.platform) {
      case 'win32':
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      case 'darwin':
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      case 'linux':
        return '/usr/bin/google-chrome';
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    try {
      this.browser = await puppeteer.launch({
        executablePath: this.chromePath,
        headless: false,
        args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
        ],
      });

      // Close browser on process exit
      process.on('exit', () => {
        if (this.browser) {
          this.browser.close();
        }
      });

      return this.browser;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw new Error('Failed to initialize browser');
    }
  }

  async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Set default viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    );

    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Basic scraping method
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
}
