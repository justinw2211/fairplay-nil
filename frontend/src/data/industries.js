// frontend/src/data/industries.js
// NIL-relevant industry options for payor classification (ordered alphabetically)

export const INDUSTRY_OPTIONS = [
  'AI/Machine Learning',
  'Auto Parts',
  'Auto Services',
  'Banking',
  'Beverages',
  'Car Dealerships',
  'Car Manufacturers',
  'Cloud Services',
  'Clothing',
  'Cosmetics',
  'CPG (Consumer Packaged Goods)',
  'EdTech',
  'Electric Vehicles',
  'Events',
  'Fashion Retail',
  'Fast Food',
  'FinTech',
  'Fitness/Wellness',
  'Food Delivery',
  'Gaming',
  'Hardware',
  'Insurance',
  'Investment',
  'Jewelry',
  'Media',
  'Medical Devices',
  'Mental Health',
  'Mobile Apps',
  'Online Learning',
  'Pharmaceuticals',
  'Property Development',
  'Property Management',
  'Real Estate Finance',
  'Real Estate Services',
  'Restaurants',
  'Social Media',
  'Software',
  'Sports Apparel',
  'Sports Betting',
  'Sports Equipment',
  'Sports Media',
  'Streaming',
  'Telemedicine',
  'Training Programs',
  'Training/Fitness',
  'Universities',
  'Other'
];

// Helper function to get filtered industries based on search
export const getFilteredIndustries = (searchTerm = '') => {
  if (!searchTerm) return INDUSTRY_OPTIONS;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  return INDUSTRY_OPTIONS.filter(industry => 
    industry.toLowerCase().includes(lowercaseSearch)
  );
};

// Helper function to format industries for display
export const formatIndustries = (industries) => {
  if (!industries || industries.length === 0) return 'None selected';
  if (industries.length === 1) return industries[0];
  if (industries.length <= 3) return industries.join(', ');
  return `${industries.slice(0, 2).join(', ')} and ${industries.length - 2} more`;
};

// Helper function to check if an industry is valid
export const isValidIndustry = (industry) => {
  return INDUSTRY_OPTIONS.includes(industry);
};

// Helper function to validate industry array
export const validateIndustries = (industries) => {
  if (!Array.isArray(industries)) return false;
  if (industries.length === 0) return false;
  return industries.every(industry => isValidIndustry(industry));
};

