// frontend/src/data/companySizes.js
// Revenue-based company size configuration for NIL deal payor classification

export const COMPANY_SIZE_OPTIONS = [
  {
    value: 'individual',
    label: 'Individual/Sole Proprietor',
    description: 'Personal brand deals, individual sponsorships',
    example: 'Personal trainer, local influencer, individual sponsor',
    revenueRange: 'Personal income',
    nilDealRange: '$100 - $1,000'
  },
  {
    value: 'small_business', 
    label: 'Small Business',
    description: 'Local businesses, single-location operations (<$1M revenue)',
    example: 'Local coffee shop, neighborhood restaurant, small retail store',
    revenueRange: 'Under $1M annually',
    nilDealRange: '$500 - $2,000'
  },
  {
    value: 'medium_business',
    label: 'Medium Business', 
    description: 'Regional chains, growing companies ($1M-$50M revenue)',
    example: 'Regional coffee chain, local car dealership, growing startup',
    revenueRange: '$1M - $50M annually',
    nilDealRange: '$2,000 - $20,000'
  },
  {
    value: 'large_corporation',
    label: 'Large Corporation',
    description: 'National brands, Fortune 500 companies (>$50M revenue)',
    example: 'Nike, Coca-Cola, McDonald\'s, major sports brands',
    revenueRange: 'Over $50M annually',
    nilDealRange: '$10,000 - $100,000+'
  },
  {
    value: 'startup',
    label: 'Startup/VC-Backed',
    description: 'High-growth startups with significant funding',
    example: 'Tech startups, venture-backed companies, high-growth businesses',
    revenueRange: 'Varies with funding',
    nilDealRange: '$1,000 - $25,000'
  },
  {
    value: 'nonprofit',
    label: 'Nonprofit Organization',
    description: 'Charities, foundations, educational institutions',
    example: 'Local charities, university programs, community foundations',
    revenueRange: 'Donation-based',
    nilDealRange: '$500 - $5,000'
  },
  {
    value: 'government',
    label: 'Government Entity',
    description: 'Municipal, state, or federal government',
    example: 'City tourism boards, state agencies, government programs',
    revenueRange: 'Tax-funded',
    nilDealRange: '$1,000 - $10,000'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other organization types not listed above',
    example: 'Cooperatives, associations, other unique organizations',
    revenueRange: 'Varies',
    nilDealRange: 'Varies'
  }
];

// Helper function to get company size option by value
export const getCompanySizeOption = (value) => {
  return COMPANY_SIZE_OPTIONS.find(option => option.value === value);
};

// Helper function to get company size label
export const getCompanySizeLabel = (value) => {
  const option = getCompanySizeOption(value);
  return option ? option.label : 'Unknown';
};

// Helper function to format company size for display
export const formatCompanySize = (value) => {
  const option = getCompanySizeOption(value);
  if (!option) return 'Unknown';
  
  return `${option.label} - ${option.description}`;
};

