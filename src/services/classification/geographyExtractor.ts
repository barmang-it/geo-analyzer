
export const extractGeographyHints = (businessName: string, websiteUrl: string): string => {
  const geoKeywords = {
    'Global': ['global', 'international', 'worldwide', 'pepsi', 'coca-cola', 'mcdonalds', 'apple', 'microsoft', 'google', 'akamai'],
    'US': ['.com', 'america', 'usa', 'united states', 'california', 'new york', 'texas', 'inc', 'corp'],
    'UK': ['.co.uk', 'london', 'britain', 'england', 'uk', 'ltd'],
    'EU': ['.de', '.fr', '.es', '.it', 'europe', 'berlin', 'paris', 'gmbh']
  };
  
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  for (const [region, keywords] of Object.entries(geoKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return region;
    }
  }
  
  return 'US'; // Default
};
