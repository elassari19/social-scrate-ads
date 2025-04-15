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
    href: '/product/tonfy-store',
    icon: Store,
  },
  {
    title: 'Actors',
    description: 'Build and run serverless programs',
    href: '/product/actors',
    icon: Bot,
  },
  {
    title: 'Integrations',
    description: 'Connect with apps and services',
    href: '/product/integrations',
    icon: Puzzle,
  },
  {
    title: 'Storage',
    description: 'Store results for web scrapers',
    href: '/product/storage',
    icon: Database,
  },
];

const productAntiBlock = [
  {
    title: 'Anti-blocking',
    description: 'Scrape without getting blocked',
    href: '/product/anti-blocking',
    icon: CloudCog,
  },
  {
    title: 'Proxy',
    description: 'Rotate scraper IP addresses',
    href: '/product/proxy',
    icon: LocateIcon,
  },
  {
    title: 'Crawlee',
    description: 'Web scraping and crawling library',
    href: '/product/crawlee',
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
        href: '/solutions/enterprise',
        icon: TbBuildingSkyscraper,
      },
      {
        title: 'Startups',
        href: '/solutions/startups',
        icon: PiAcorn,
      },
      {
        title: 'Universities',
        href: '/solutions/universities',
        icon: RiGraduationCapLine,
      },
      {
        title: 'Nonprofits',
        href: '/solutions/nonprofits',
        icon: TiGroupOutline,
      },
    ],
  },
  {
    title: 'Use cases',
    list: [
      {
        title: 'Market research',
        href: '/solutions/market-research',
        icon: ChartBarIcon,
      },
      {
        title: 'Business intelligence',
        href: '/solutions/business-intelligence',
        icon: TbMessageChatbot,
      },
      {
        title: 'E-commerce',
        href: '/solutions/e-commerce',
        icon: Store,
      },
      {
        title: 'Real estate',
        href: '/solutions/real-estate',
        icon: Bot,
      },
    ],
  },
  {
    title: 'Consulting',
    list: [
      {
        title: 'Web scraping consulting',
        href: '/solutions/web-scraping-consulting',
        icon: Bot,
      },
      {
        title: 'Data engineering',
        href: '/solutions/data-engineering',
        icon: Database,
      },
      {
        title: 'Data science',
        href: '/solutions/data-science',
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
