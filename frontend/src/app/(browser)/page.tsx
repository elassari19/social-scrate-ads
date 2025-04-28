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
import Link from 'next/link';
import SearchInput from '../../components/ui/search-input';
import { mockActors } from '../../utils/constants';

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
      <HeroSection
        heroHeader={
          <div className="mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your full-stack platform for web scraping
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Tonfy is the largest ecosystem where developers build, deploy, and
              publish web scrapers, AI agents, and automation tools. We call
              them Actors.
            </p>
            <div className="mt-8">
              <SearchInput
                path="/store/actors"
                placeholder="Search for actors, e.g., Google Maps Scraper"
              />
            </div>
          </div>
        }
        actors={mockActors.slice(0, 5)}
        buildActor={buildActor}
        heroFooter={
          <div className="mt-10 text-center">
            <Link
              href="/store"
              className="inline-flex items-center text-gray-700 hover:text-gray-900"
            >
              <span>Browse More Actors</span>
              <span className="ml-1">→</span>
            </Link>
          </div>
        }
      />

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
