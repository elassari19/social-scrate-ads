import { Browser, LaunchOptions } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

export interface BrowserConfig {
  executablePath: string;
  headless: boolean;
  args?: string[];
  defaultViewport?: {
    width: number;
    height: number;
  };
  defaultUserAgent?: string;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private config: BrowserConfig;

  constructor(config?: Partial<BrowserConfig>) {
    this.config = {
      executablePath: config?.executablePath || this.getDefaultChromePath(),
      headless: config?.headless ?? false,
      args: config?.args || [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
      defaultViewport: config?.defaultViewport || { width: 1280, height: 800 },
      defaultUserAgent:
        config?.defaultUserAgent ||
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    };
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
      const launchOptions: LaunchOptions = {
        executablePath: this.config.executablePath,
        headless: this.config.headless,
        args: this.config.args,
      };

      this.browser = await puppeteer.launch(launchOptions);

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

  async createPage() {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Set default viewport and user agent
    await page.setViewport(this.config.defaultViewport!);
    await page.setUserAgent(this.config.defaultUserAgent!);

    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export a singleton instance with default configuration
export const browserManager = new BrowserManager();
