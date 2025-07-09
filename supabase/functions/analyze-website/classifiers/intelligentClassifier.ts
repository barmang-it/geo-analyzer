
import { BusinessClassification } from '../types.ts';

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export function performIntelligentClassification(
  businessName: string,
  websiteUrl: string,
  websiteContent?: WebsiteContent
): BusinessClassification {
  const businessNameLower = businessName.toLowerCase();
  const urlLower = websiteUrl.toLowerCase();
  
  // Combine website content for analysis
  let contentText = '';
  if (websiteContent) {
    contentText = `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}`.toLowerCase();
  }
  
  const fullText = `${businessNameLower} ${urlLower} ${contentText}`;
  
  // Extract geography intelligently
  const geography = extractGeographyIntelligently(fullText);
  
  // Industry classification based on comprehensive content analysis
  const industryAnalysis = analyzeIndustry(fullText);
  const market = getMarketForIndustry(industryAnalysis.industry, fullText);
  const domain = getDomainForIndustry(industryAnalysis.industry, market, fullText);
  
  return {
    industry: industryAnalysis.industry,
    market,
    geography,
    domain
  };
}

function extractGeographyIntelligently(fullText: string): string {
  // Global indicators - strong signals
  const globalIndicators = [
    'international', 'worldwide', 'global', 'multinational',
    'fortune 500', 'fortune 1000', 'nasdaq', 'nyse', 'ftse',
    'offices in', 'countries', 'continents', 'headquarters',
    'subsidiaries', 'branches worldwide', 'global presence',
    'international operations', 'worldwide network',
    'publicly traded', 'public company', 'stock exchange'
  ];
  
  // Regional indicators with weights
  const regionIndicators = {
    'Global': [...globalIndicators],
    'US': ['.com', 'america', 'usa', 'united states', 'california', 'new york', 'texas', 'inc', 'corp', 'llc'],
    'UK': ['.co.uk', 'london', 'britain', 'england', 'uk', 'ltd', 'plc'],
    'EU': ['.de', '.fr', '.es', '.it', 'europe', 'berlin', 'paris', 'madrid', 'rome', 'gmbh', 'sarl'],
    'Asia': ['.jp', '.cn', '.in', '.sg', 'japan', 'china', 'india', 'singapore', 'tokyo', 'beijing']
  };
  
  // Calculate scores for each region
  const regionScores: { [key: string]: number } = {};
  
  for (const [region, keywords] of Object.entries(regionIndicators)) {
    regionScores[region] = keywords.filter(keyword => fullText.includes(keyword)).length;
    
    // Give extra weight to global indicators
    if (region === 'Global' && regionScores[region] > 0) {
      regionScores[region] *= 2;
    }
  }
  
  // Find the region with the highest score
  const maxScore = Math.max(...Object.values(regionScores));
  if (maxScore > 0) {
    const topRegion = Object.entries(regionScores)
      .find(([_, score]) => score === maxScore)?.[0];
    return topRegion || 'US';
  }
  
  return 'US'; // Default fallback
}

function analyzeIndustry(fullText: string): { industry: string; confidence: number } {
  const industryKeywords = {
    'Technology': [
      'software', 'saas', 'platform', 'api', 'cloud', 'developer', 'tech',
      'artificial intelligence', 'machine learning', 'data', 'analytics',
      'cybersecurity', 'security', 'firewall', 'encryption', 'cdn',
      'performance', 'optimization', 'automation', 'integration',
      'computing', 'digital', 'innovation', 'startup'
    ],
    'Healthcare': [
      'health', 'medical', 'pharma', 'pharmaceutical', 'clinic', 'hospital',
      'wellness', 'therapy', 'treatment', 'medicine', 'healthcare',
      'biotech', 'life sciences', 'diagnostic'
    ],
    'Financial Services': [
      'bank', 'banking', 'finance', 'financial', 'payment', 'fintech',
      'investment', 'insurance', 'credit', 'loan', 'trading',
      'wealth management', 'asset management'
    ],
    'Food & Beverage': [
      'food', 'beverage', 'drink', 'restaurant', 'snack', 'nutrition',
      'soda', 'juice', 'water', 'coffee', 'tea', 'dairy', 'soft drink',
      'cuisine', 'dining', 'catering'
    ],
    'Automotive': [
      'auto', 'automotive', 'car', 'vehicle', 'electric vehicle',
      'transportation', 'mobility', 'manufacturing', 'tesla',
      'automotive technology'
    ],
    'Energy': [
      'energy', 'oil', 'gas', 'renewable', 'solar', 'wind', 'utilities',
      'power', 'electricity', 'petroleum', 'clean energy'
    ],
    'Retail': [
      'retail', 'shop', 'store', 'ecommerce', 'marketplace', 'buy',
      'sell', 'consumer', 'shopping', 'fashion', 'apparel'
    ],
    'Conglomerate': [
      'holdings', 'group', 'corporation', 'industries', 'conglomerate',
      'diversified', 'multinational corporation', 'enterprise group',
      'holding company', 'business group'
    ]
  };
  
  let bestIndustry = 'Technology';
  let maxMatches = 0;
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matches = keywords.filter(keyword => fullText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIndustry = industry;
    }
  }
  
  return { industry: bestIndustry, confidence: maxMatches };
}

function getMarketForIndustry(industry: string, fullText: string): string {
  switch (industry) {
    case 'Technology':
      if (fullText.includes('enterprise') || fullText.includes('b2b')) return 'Enterprise Software';
      if (fullText.includes('consumer') || fullText.includes('mobile')) return 'Consumer Electronics';
      if (fullText.includes('cloud') || fullText.includes('infrastructure')) return 'Cloud Infrastructure';
      return 'B2B SaaS';
    case 'Food & Beverage':
      return 'Consumer Packaged Goods';
    case 'Healthcare':
      return 'Digital Health';
    case 'Financial Services':
      return 'Banking & Fintech';
    case 'Automotive':
      return fullText.includes('electric') ? 'Electric Vehicles' : 'Auto Manufacturing';
    case 'Energy':
      return 'Energy & Utilities';
    case 'Retail':
      return 'E-commerce';
    case 'Conglomerate':
      return 'Multi-Industry';
    default:
      return 'Professional Services';
  }
}

function getDomainForIndustry(industry: string, market: string, fullText: string): string {
  if (industry === 'Technology') {
    if (fullText.includes('security') || fullText.includes('cyber')) return 'Cybersecurity & Performance';
    if (fullText.includes('performance') || fullText.includes('cdn')) return 'Performance & CDN';
    if (market === 'Enterprise Software') return 'Enterprise Software';
    if (market === 'Consumer Electronics') return 'Consumer Electronics';
    if (market === 'Cloud Infrastructure') return 'Cloud & Infrastructure';
    return 'Software Solutions';
  }
  
  if (industry === 'Food & Beverage') return 'Consumer Products';
  if (industry === 'Conglomerate') return 'Diversified Conglomerate';
  if (industry === 'Healthcare') return 'Healthcare';
  if (industry === 'Financial Services') return 'Financial Services';
  if (industry === 'Automotive') return 'Automotive Technology';
  if (industry === 'Energy') return 'Energy';
  if (industry === 'Retail') return 'E-commerce';
  
  return 'Professional Services';
}
