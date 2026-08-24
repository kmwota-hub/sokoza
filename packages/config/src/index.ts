// SOKOZA System Constants & Configuration

export const APP_CONFIG = {
  name: 'SOKOZA',
  tagline: 'Shop Local. Get It Delivered.',
  currency: 'KSh',
  country: 'Kenya',
  initialLocation: {
    name: 'Juja',
    county: 'Kiambu',
    latitude: -1.1026,
    longitude: 37.0132,
    defaultRadiusKm: 15,
  },
  expansionLocations: [
    'Ruiru',
    'Thika',
    'Kiambu',
    'Nairobi',
  ],
  supportEmail: 'support@sokoza.co.ke',
  featureRequestQuestion: 'What problem can Sokoza solve to help your business grow?',
};

export const DELIVERY_CONFIG = {
  defaultFeeBase: 100, // KSh base
  feePerKm: 25, // KSh per kilometer
  riderAcceptTimeoutSeconds: 60,
  maxRiderSearchRadiusKm: 10,
};

export const COMMISSION_CONFIG = {
  defaultPlatformFeePercent: 5.0, // 5% platform fee on order
  defaultRiderCommissionPercent: 80.0, // 80% of delivery fee to rider
};

export const SYSTEM_ROLES = [
  'CUSTOMER',
  'BUSINESS_OWNER',
  'BUSINESS_STAFF',
  'RIDER',
  'ADMIN',
] as const;
