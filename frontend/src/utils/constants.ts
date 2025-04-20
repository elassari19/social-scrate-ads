import {
  Store,
  Bot,
  Puzzle,
  Database,
  CloudCog,
  LocateIcon,
  Navigation,
  ChartBarIcon,
} from 'lucide-react';
import { TiLightbulb, TiGroupOutline } from 'react-icons/ti';
import { TbBuildingSkyscraper, TbMessageChatbot } from 'react-icons/tb';
import { FiEdit } from 'react-icons/fi';
import { BsPersonGear } from 'react-icons/bs';
import { PiAcorn } from 'react-icons/pi';
import { RiGraduationCapLine } from 'react-icons/ri';

const productionPlatform = [
  {
    title: 'Tonfy Store',
    description: 'Pre-built web scraping tools',
    href: '/store',
    icon: Store,
  },
  {
    title: 'Actors',
    description: 'Build and run serverless programs',
    href: '/actors',
    icon: Bot,
  },
  {
    title: 'Integrations',
    description: 'Connect with apps and services',
    href: '/integrations',
    icon: Puzzle,
  },
  {
    title: 'Storage',
    description: 'Store results for web scrapers',
    href: '/storage',
    icon: Database,
  },
];

const productAntiBlock = [
  {
    title: 'Anti-blocking',
    description: 'Scrape without getting blocked',
    href: '/anti-blocking',
    icon: CloudCog,
  },
  {
    title: 'Proxy',
    description: 'Rotate scraper IP addresses',
    href: '/proxy',
    icon: LocateIcon,
  },
  {
    title: 'Crawlee',
    description: 'Web scraping and crawling library',
    href: '/crawlee',
    icon: Navigation,
  },
];

export const productItems = [
  {
    title: 'The Tonfy platform',
    list: productionPlatform,
  },
  {
    title: 'Anti-blocking',
    list: productAntiBlock,
  },
];

export const solutions = [
  {
    title: 'Web data for',
    list: [
      {
        title: 'Enterprise',
        href: '/enterprise',
        icon: TbBuildingSkyscraper,
      },
      {
        title: 'Startups',
        href: '/startups',
        icon: PiAcorn,
      },
      {
        title: 'Universities',
        href: '/universities',
        icon: RiGraduationCapLine,
      },
      {
        title: 'Nonprofits',
        href: '/nonprofits',
        icon: TiGroupOutline,
      },
    ],
  },
  {
    title: 'Use cases',
    list: [
      {
        title: 'Market research',
        href: '/market-research',
        icon: ChartBarIcon,
      },
      {
        title: 'Business intelligence',
        href: '/business-intelligence',
        icon: TbMessageChatbot,
      },
      {
        title: 'E-commerce',
        href: '/e-commerce',
        icon: Store,
      },
      {
        title: 'Real estate',
        href: '/real-estate',
        icon: Bot,
      },
    ],
  },
  {
    title: 'Consulting',
    list: [
      {
        title: 'Web scraping consulting',
        href: '/web-scraping-consulting',
        icon: Bot,
      },
      {
        title: 'Data engineering',
        href: '/data-engineering',
        icon: Database,
      },
      {
        title: 'Data science',
        href: '/data-science',
        icon: CloudCog,
      },
    ],
  },
];

export const resources = [
  {
    title: 'Documentation',
    list: [
      {
        title: 'Help and support',
        href: 'help-and-support',
        description: 'Advice and answers about Tonfy',
        icon: TbMessageChatbot,
      },
      {
        title: 'Submit your ideas',
        href: 'submit-your-ideas',
        description: 'Tell us the Actors you want',
        icon: TiLightbulb,
      },
      {
        title: 'Changelog',
        href: 'changelog',
        description: "See what's new on Tonfy",
        icon: FiEdit,
      },
      {
        title: 'Customer stories',
        href: 'customer-stories',
        description: 'Find out how others use Tonfy',
        icon: BsPersonGear,
      },
    ],
  },
  {
    title: 'Company',
    list: [
      {
        title: 'About Tonfy',
        href: 'about-us',
      },
      {
        title: 'Contact us',
        href: 'contact-us',
      },
      {
        title: 'Blog',
        href: 'blog',
      },
      {
        title: 'Tonfy Partners',
        href: 'tonfy-partners',
      },
    ],
  },
];

// Store page categories and subcategories
export const storeCategories = [
  {
    name: 'Social media',
    url: 'social-media',
  },
  {
    name: 'AI',
    url: 'ai',
  },
  {
    name: 'Agents',
    url: 'agents',
  },
  {
    name: 'Lead Generation',
    url: 'lead-generation',
  },
  {
    name: 'E-commerce',
    url: 'e-commerce',
  },
  {
    name: 'SEO tools',
    url: 'seo-tools',
  },
  {
    name: 'Jobs',
    url: 'jobs',
  },
  {
    name: 'News',
    url: 'news',
  },
  {
    name: 'Real estate',
    url: 'real-estate',
  },
  {
    name: 'Developer tools',
    url: 'developer-tools',
  },
  {
    name: 'Travel',
    url: 'travel',
  },
  {
    name: 'Videos',
    url: 'videos',
  },
  {
    name: 'Automation',
    url: 'automation',
  },
  {
    name: 'Integrations',
    url: 'integrations',
  },
  {
    name: 'Open source',
    url: 'open-source',
  },
  {
    name: 'Other',
    url: 'other',
  },
];

// Mock actors data for the store page
export const mockActors = [
  {
    id: 1,
    title: 'Website Content Crawler',
    namespace: 'website-content-crawler',
    description:
      'Crawl websites and extract text content to feed AI models, LLM applications, vector databases, or RAG pipelines. The Actor supports rich formatting including paragraphs, lists, and tables.',
    stars: '44.3k',
    rating: 4.6,
    authorName: 'Apify',
    authorBadgeColor: 'bg-yellow-200',
    icon: '🕸️',
    iconBg: 'bg-red-100',
    badges: ['AI'],
  },
  {
    id: 2,
    title: 'Google Maps Scraper',
    namespace: 'crawler-google-places',
    description:
      'Extract data from thousands of Google Maps locations and businesses. Get Google Maps data including reviews, reviewer details, images, popular times, and more.',
    stars: '93.3k',
    rating: 4.2,
    authorName: 'Compass',
    authorBadgeColor: 'bg-green-200',
    icon: '🌍',
    iconBg: 'bg-green-100',
    badges: [],
  },
  {
    id: 3,
    title: 'Instagram Scraper',
    namespace: 'instagram-scraper',
    description:
      'Scrape and download Instagram posts, profiles, places, hashtags, photos, and comments. Get data from Instagram using one or more Instagram URLs.',
    stars: '86.1k',
    rating: 4.3,
    authorName: 'Apify',
    authorBadgeColor: 'bg-yellow-200',
    icon: '📷',
    iconBg: 'bg-pink-100',
    badges: ['Social Media'],
  },
  {
    id: 4,
    title: 'Twitter (X.com) Scraper Unlimited: No Rate-Limits',
    namespace: 'twitter-scraper-lite',
    description:
      'Introducing Twitter Scraper Unlimited, the most comprehensive Twitter data extraction solution available. Our enterprise-grade scraper offers unlimited data extraction with no rate limits.',
    stars: '3.6k',
    rating: 4.6,
    authorName: 'API Dojo',
    authorBadgeColor: 'bg-red-200',
    icon: '𝕏',
    iconBg: 'bg-black text-white',
    badges: ['Social Media'],
  },
  {
    id: 5,
    title: 'Facebook Posts Scraper',
    namespace: 'facebook-posts-scraper',
    description:
      'Extract data from hundreds of Facebook posts from one or multiple Facebook pages and profiles. Get post URL, post text, page or profile URL, reactions, and more.',
    stars: '20.5k',
    rating: 4.5,
    authorName: 'Apify',
    authorBadgeColor: 'bg-yellow-200',
    icon: '📱',
    iconBg: 'bg-blue-100',
    badges: ['Social Media'],
  },
  {
    id: 6,
    title: 'TikTok Data Extractor',
    namespace: 'free-tiktok-scraper',
    description:
      'Extract data about videos, users, and channels based on hashtags or scrape full user profiles including posts, total likes, name, nickname, followers, and following.',
    stars: '24.9k',
    rating: 4.8,
    authorName: 'Clockworks',
    authorBadgeColor: 'bg-purple-200',
    icon: '🎵',
    iconBg: 'bg-black text-white',
    badges: ['Social Media'],
  },
];

export const developerTools = [
  {
    id: 1,
    title: 'Cheerio Scraper',
    namespace: 'apify/cheerio-scraper',
    description:
      'Crawls websites using raw HTTP requests, parses the HTML with the Cheerio library, and extracts data from the pages using a Node.js code.',
    stars: '7.1k',
    rating: 4.7,
    authorName: 'Apify',
    authorBadgeColor: 'blue',
    icon: '🔶',
    iconBg: 'bg-amber-100',
  },
  {
    id: 2,
    title: 'Web Scraper',
    namespace: 'apify/web-scraper',
    description:
      'Crawls arbitrary websites using a web browser and extracts structured data from web pages using a provided JavaScript function. The Actor supports',
    stars: '80k',
    rating: 4.5,
    authorName: 'Apify',
    authorBadgeColor: 'blue',
    icon: '🌐',
    iconBg: 'bg-blue-100',
  },
  {
    id: 3,
    title: 'Puppeteer Scraper',
    namespace: 'apify/puppeteer-scraper',
    description:
      'Crawls websites with the headless Chrome and Puppeteer library using a provided server-side Node.js code. This crawler is an alternative to',
    stars: '6.1k',
    rating: 5.0,
    authorName: 'Apify',
    authorBadgeColor: 'blue',
    icon: '🤖',
    iconBg: 'bg-cyan-100',
  },
];
