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
    icon: 'https://images.apifyusercontent.com/Q3n5SF1SFDjB0Q-opIqN87lcyICJMvxlH09ynsqMjyA/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9hWUcwbDlzN2RiQjdqM2diUy9QZlRvRU5rSlp4YWh6UER1My1DbGVhblNob3RfMjAyMy0wMy0yOF9hdF8xMC40MC4yMF8yeC5wbmc.webp',
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
    icon: 'https://images.apifyusercontent.com/VrMzpJHsE6qRWzy3aI5eVNyV6FGg5UZfHcDDpuQP0_E/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9ud3VhOUd1NVlyQURMN1pEai80UmpnTVhQdzdyNFo3WEFnYS1Hb29nbGVfTWFwc19TY3JhcGVyLnBuZw.webp',
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
    icon: 'https://images.apifyusercontent.com/632TuWCku033QESt8HdWIF9rTy0SF_RPrbkQFdBdeQg/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9zaHU4aHZyWGJKYlkzRWI5Vy9LQTk4aWd0S3RZaldtRmt1Yy1JbnN0YWdyYW1fU2NyYXBlci5wbmc.webp',
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
    icon: 'https://images.apifyusercontent.com/MckZeZ_H_yuAP2NoJfhtWIbt4gt-VNCWf00W0ANbXRI/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vWGdpZmtoNDhqaTVBNTVCcFotYWN0b3ItbmZwMWZwdDVnVWxCd1Bjb3ItaDJxbkVvYU42dC1uZXctMjAyMy10d2l0dGVyLWxvZ28teC1pY29uLWRlc2lnbl8xMDE3LTQ1NDE4LnBuZw.webp',
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
    icon: 'https://images.apifyusercontent.com/JPzgrUcZL1XMQM1xTiy9eJiJM8uqhld4SkhFhOOYf5c/rs:fill:250:250/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9Lb0pyZHhKQ1R0cG9uODFLWS9idmlzeTkyN2ZkRFRNS0VLVC1GYWNlYm9va19Qb3N0c19TY3JhcGVyLnBuZw.webp',
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
    icon: 'https://images.apifyusercontent.com/5TrEQbTFGVZia_ZUYmobfvO6YvVxiQX0l3HXv7x7-uU/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9HZFdDa3hCdEtXT3NLamRjaC96dExHNWhUM1pMaEFGRmVLTi1UaWtUb2tfU2NyYXBlci5wbmc.webp',
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
    icon: 'https://images.apifyusercontent.com/Bl_jucUPcDz953HNwVAPLH0JoJFbKDUeJMGH6IV6Gl0/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9ZclF1RWtvd2tOQ0xkazRqMi9Ldm1mR3lXTFBaNzZ1OW1ueS1DaGVlcmlvMTAwcHgucG5n.webp',
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
    icon: 'https://images.apifyusercontent.com/Q3n5SF1SFDjB0Q-opIqN87lcyICJMvxlH09ynsqMjyA/rs:fill:76:76/cb:1/aHR0cHM6Ly9hcGlmeS1pbWFnZS11cGxvYWRzLXByb2QuczMuYW1hem9uYXdzLmNvbS9hWUcwbDlzN2RiQjdqM2diUy9QZlRvRU5rSlp4YWh6UER1My1DbGVhblNob3RfMjAyMy0wMy0yOF9hdF8xMC40MC4yMF8yeC5wbmc.webp',
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
    icon: 'https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png',
  },
];
