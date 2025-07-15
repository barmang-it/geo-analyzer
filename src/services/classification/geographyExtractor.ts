
export const extractGeographyHints = (businessName: string, websiteUrl: string, websiteContent?: string): string => {
  const text = `${businessName} ${websiteUrl} ${websiteContent || ''}`.toLowerCase();
  
  // Major global companies - explicit list
  const majorGlobalCompanies = [
    'microsoft', 'apple', 'google', 'amazon', 'meta', 'facebook', 'tesla', 'netflix',
    'adobe', 'salesforce', 'oracle', 'ibm', 'intel', 'nvidia', 'cisco', 'vmware',
    'uber', 'airbnb', 'spotify', 'zoom', 'slack', 'dropbox', 'atlassian', 'shopify',
    'paypal', 'stripe', 'square', 'twilio', 'datadog', 'snowflake', 'palantir',
    'coca-cola', 'pepsi', 'mcdonalds', 'starbucks', 'nike', 'adidas', 'walmart',
    'visa', 'mastercard', 'american express', 'jp morgan', 'goldman sachs',
    'exxon', 'chevron', 'shell', 'bp', 'total', 'toyota', 'volkswagen', 'ford',
    'general motors', 'bmw', 'mercedes', 'audi', 'ferrari', 'porsche'
  ];
  
  // Check if it's a major global company
  if (majorGlobalCompanies.some(company => text.includes(company))) {
    return 'Global';
  }
  
  // Global indicators - strong signals
  const globalIndicators = [
    'international', 'worldwide', 'global', 'multinational',
    'offices in', 'countries', 'continents', 'headquarters',
    'subsidiaries', 'branches worldwide', 'global presence',
    'international operations', 'worldwide network'
  ];
  
  // Regional indicators
  const regionIndicators = {
    'US': ['.com', 'america', 'usa', 'united states', 'california', 'new york', 'texas', 'inc', 'corp', 'llc'],
    'UK': ['.co.uk', 'london', 'britain', 'england', 'uk', 'ltd', 'plc'],
    'EU': ['.de', '.fr', '.es', '.it', 'europe', 'berlin', 'paris', 'madrid', 'rome', 'gmbh', 'sarl'],
    'Asia': ['.jp', '.cn', '.in', '.sg', 'japan', 'china', 'india', 'singapore', 'tokyo', 'beijing'],
    'Global': ['fortune', 'nasdaq', 'nyse', 'ftse', 'dax', 'public company', 'publicly traded']
  };
  
  // Check for global indicators
  if (globalIndicators.some(indicator => text.includes(indicator))) {
    return 'Global';
  }
  
  // Count regional matches
  const regionScores: { [key: string]: number } = {};
  
  for (const [region, keywords] of Object.entries(regionIndicators)) {
    regionScores[region] = keywords.filter(keyword => text.includes(keyword)).length;
  }
  
  // Find the region with the highest score
  const maxScore = Math.max(...Object.values(regionScores));
  if (maxScore > 0) {
    const topRegion = Object.entries(regionScores)
      .find(([_, score]) => score === maxScore)?.[0];
    return topRegion || 'US';
  }
  
  return 'US'; // Default fallback
};
