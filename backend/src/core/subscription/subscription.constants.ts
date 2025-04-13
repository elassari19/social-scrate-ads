export const SUBSCRIPTION_LIMITS = {
  Basic: {
    requestLimit: 10,
    dataPointLimit: 10,
  },
  Pro: {
    requestLimit: 50,
    dataPointLimit: 50,
  },
  Business: {
    requestLimit: -1, // Unlimited
    dataPointLimit: -1, // Unlimited
  },
} as const;

export const SUBSCRIPTION_FEATURES = {
  Basic: {
    description: 'Basic plan with limited access',
    platforms: ['Meta'],
  },
  Pro: {
    description: 'Professional plan with extended access',
    platforms: ['Meta', 'Google'],
    stripeProductId: 'price_1RDSiaRr31q7h9eW83ySDu5D',
  },
  Business: {
    description: 'Business plan with unlimited access',
    platforms: ['Meta', 'Google', 'TikTok'],
    stripeProductId: 'price_1RDSjTRr31q7h9eWoSwlBeoE',
  },
} as const;
