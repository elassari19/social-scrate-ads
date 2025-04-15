import HeroSection from '../../components/sections/hero-section';
import FeatureSection from '../../components/sections/feature-section';
import PublisherSection from '../../components/sections/publisher-section';
import EnterpriseSection from '../../components/sections/enterprise-section';
import GetStartedCta from '../../components/sections/get-started-cta';

import buildActorImage from '@/assets/home/build.png';
import scrapeImage from '@/assets/home/scrape.png';
import servicesImage from '@/assets/home/services.png';
import publishImage from '@/assets/home/publish.png';
import soc2Image from '@/assets/home/soc2.png';
import gdprImage from '@/assets/home/gdpr.png';
import avatarImage from '@/assets/home/avatar.png';

const actorCards = [
  {
    id: 1,
    title: 'TikTok Data Extractor',
    namespace: 'clockworks/free-tiktok-scraper',
    description:
      'Extract data about videos, users, and channels based on hashtags or scrape full user profiles.',
    stars: '25k',
    rating: 4.8,
    authorName: 'Clockworks',
    authorBadgeColor: 'bg-purple-100',
    icon: '🎵',
    iconBg: 'bg-black',
  },
  {
    id: 2,
    title: 'Google Maps Extractor',
    namespace: 'compass/google-maps-extractor',
    description:
      'Extract data from hundreds of places fast. Scrape Google Maps by keyword, category, location.',
    stars: '37.3k',
    rating: 4.3,
    authorName: 'Compass',
    authorBadgeColor: 'bg-green-100',
    icon: '🗺️',
    iconBg: 'bg-white border',
  },
  {
    id: 3,
    title: 'Instagram Scraper',
    namespace: 'Tonfy/instagram-scraper',
    description:
      'Scrape and download Instagram posts, profiles, places, hashtags, photos, and comments. Get images.',
    stars: '86.4k',
    rating: 4.3,
    authorName: 'Tonfy',
    authorBadgeColor: 'bg-yellow-100',
    icon: '📸',
    iconBg: 'bg-gradient-to-tr from-pink-500 to-purple-600',
  },
  {
    id: 4,
    title: 'Website Content Crawler',
    namespace: 'Tonfy/website-content-crawler',
    description:
      'Crawl websites and extract text content to feed AI models, LLM applications, vector databases, or more.',
    stars: '44.5k',
    rating: 4.6,
    authorName: 'Tonfy',
    authorBadgeColor: 'bg-yellow-100',
    icon: '🕸️',
    iconBg: 'bg-blue-600',
  },
  {
    id: 5,
    title: 'Amazon Scraper',
    namespace: 'junglee/free-amazon-product-scraper',
    description:
      'Gets you product data from Amazon. Unofficial API. Scrapes and downloads product information.',
    stars: '5.8k',
    rating: 4.4,
    authorName: 'Junglee',
    authorBadgeColor: 'bg-orange-100',
    icon: '🛒',
    iconBg: 'bg-white border',
  },
];

const buildActor = {
  id: 6,
  title: 'Build Your Own Actor',
  namespace: 'Tonfy/build-your-own-actor',
  description:
    'Tonfy gives you all the tools and documentation you need to build reliable scrapers. Fast.',
  stars: 'N/A',
  rating: 5.0,
  authorName: 'You',
  authorBadgeColor: 'bg-yellow-100',
  icon: '🛠️',
  iconBg: 'bg-white border',
};

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full bg-gray-50 py-10 md:py-20">
      <HeroSection actors={actorCards} buildActor={buildActor} />

      <FeatureSection
        scrapeImage={scrapeImage}
        buildActorImage={buildActorImage}
        servicesImage={servicesImage}
      />

      <PublisherSection publishImage={publishImage} />

      <EnterpriseSection
        soc2Image={soc2Image}
        gdprImage={gdprImage}
        avatarImage={avatarImage}
      />

      <GetStartedCta />
    </div>
  );
}
