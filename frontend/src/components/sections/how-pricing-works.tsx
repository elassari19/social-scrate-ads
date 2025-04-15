import React from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import images
import InstagramIcon from '@/assets/social/instagram.png';
import GoogleMapIcon from '@/assets/social/google-map.png';
import TikTokIcon from '@/assets/social/tiktok.png';

export default function HowPricingWorks() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">How pricing works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pay only for what you use with our transparent pricing model.
        </p>
      </div>

      <div className="bg-muted/40 p-8 rounded-lg max-w-4xl mx-auto">
        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="h-12 mb-6 flex-wrap w-full mx-auto p-2">
            <TabsTrigger
              value="instagram"
              className="flex items-center h-8 p-2 gap-2 transition-colors duration-300 ease-in-out"
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={InstagramIcon}
                  alt="Instagram"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span>Instagram Scraper</span>
            </TabsTrigger>
            <TabsTrigger
              value="google-maps"
              className="flex items-center h-8 p-2 gap-2 transition-colors duration-300 ease-in-out"
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={GoogleMapIcon}
                  alt="Google Maps"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span>Google Maps Scraper</span>
            </TabsTrigger>
            <TabsTrigger
              value="tiktok"
              className="flex items-center h-8 p-2 gap-2 transition-colors duration-300 ease-in-out"
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={TikTokIcon}
                  alt="TikTok"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span>TikTok Scraper</span>
            </TabsTrigger>
          </TabsList>

          {/* Instagram Tab Content */}
          <TabsContent value="instagram" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="font-semibold">21,000 results</div>
                  <div className="text-sm text-muted-foreground">$49</div>
                </div>
                <div className="bg-primary/20 rounded-lg p-4 text-center">
                  <div className="font-semibold">4,000 results</div>
                  <div className="text-sm text-muted-foreground">
                    Pay as you go
                  </div>
                  <div className="text-xs">Set your limit</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-center">
                <div className="font-medium">
                  $2.30 for 1,000 results - Pay per result
                </div>
                <div className="text-xs text-muted-foreground">
                  *Each Actor run is different. The above pricing breakdown is
                  just an example.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Google Maps Tab Content */}
          <TabsContent value="google-maps" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="font-semibold">15,000 results</div>
                  <div className="text-sm text-muted-foreground">$42</div>
                </div>
                <div className="bg-primary/20 rounded-lg p-4 text-center">
                  <div className="font-semibold">3,000 results</div>
                  <div className="text-sm text-muted-foreground">
                    Pay as you go
                  </div>
                  <div className="text-xs">Set your limit</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-center">
                <div className="font-medium">
                  $2.80 for 1,000 results - Pay per result
                </div>
                <div className="text-xs text-muted-foreground">
                  *Each Actor run is different. The above pricing breakdown is
                  just an example.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TikTok Tab Content */}
          <TabsContent value="tiktok" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="font-semibold">18,000 results</div>
                  <div className="text-sm text-muted-foreground">$45</div>
                </div>
                <div className="bg-primary/20 rounded-lg p-4 text-center">
                  <div className="font-semibold">3,500 results</div>
                  <div className="text-sm text-muted-foreground">
                    Pay as you go
                  </div>
                  <div className="text-xs">Set your limit</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-center">
                <div className="font-medium">
                  $2.50 for 1,000 results - Pay per result
                </div>
                <div className="text-xs text-muted-foreground">
                  *Each Actor run is different. The above pricing breakdown is
                  just an example.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
