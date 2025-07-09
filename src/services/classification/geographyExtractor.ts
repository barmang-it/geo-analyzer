
export const extractGeographyHints = (businessName: string, websiteUrl: string, websiteContent?: string): string => {
  const text = `${businessName} ${websiteUrl} ${websiteContent || ''}`.toLowerCase();
  
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
  
  // Check for global indicators first
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
