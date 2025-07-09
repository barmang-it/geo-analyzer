
import { BusinessClassification } from '../types';
import { extractGeographyHints } from '../geographyExtractor';

export const performIntelligentClassification = (
  businessName: string,
  websiteUrl: string,
  websiteContent?: string
): BusinessClassification => {
  const fullText = `${businessName} ${websiteUrl} ${websiteContent || ''}`.toLowerCase();
  
  // Extract geography intelligently
  const geography = extractGeographyHints(businessName, websiteUrl, websiteContent);
  
  // Industry classification based on content analysis
  const industryKeywords = {
    'Technology': [
      'software', 'saas', 'platform', 'api', 'cloud', 'developer', 'tech',
      'artificial intelligence', 'machine learning', 'data', 'analytics',
      'cybersecurity', 'security', 'firewall', 'encryption', 'cdn',
      'performance', 'optimization', 'automation', 'integration'
    ],
    'Healthcare': [
      'health', 'medical', 'pharma', 'pharmaceutical', 'clinic', 'hospital',
      'wellness', 'therapy', 'treatment', 'medicine', 'healthcare'
    ],
    'Financial Services': [
      'bank', 'banking', 'finance', 'financial', 'payment', 'fintech',
      'investment', 'insurance', 'credit', 'loan', 'trading'
    ],
    'Food & Beverage': [
      'food', 'beverage', 'drink', 'restaurant', 'snack', 'nutrition',
      'soda', 'juice', 'water', 'coffee', 'tea', 'dairy', 'soft drink'
    ],
    'Automotive': [
      'auto', 'automotive', 'car', 'vehicle', 'electric vehicle',
      'transportation', 'mobility', 'manufacturing'
    ],
    'Energy': [
      'energy', 'oil', 'gas', 'renewable', 'solar', 'wind', 'utilities',
      'power', 'electricity', 'petroleum'
    ],
    'Retail': [
      'retail', 'shop', 'store', 'ecommerce', 'marketplace', 'buy',
      'sell', 'consumer', 'shopping'
    ],
    'Conglomerate': [
      'holdings', 'group', 'corporation', 'industries', 'conglomerate',
      'diversified', 'multinational corporation', 'enterprise group'
    ]
  };
  
  // Calculate industry scores
  let bestIndustry = 'Technology';
  let maxMatches = 0;
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matches = keywords.filter(keyword => fullText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIndustry = industry;
    }
  }
  
  // Market classification based on industry and content
  const getMarket = (industry: string): string => {
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
  };
  
  // Domain classification
  const getDomain = (industry: string, market: string): string => {
    if (industry === 'Technology') {
      if (fullText.includes('security') || fullText.includes('cyber')) return 'Cybersecurity & Performance';
      if (fullText.includes('performance') || fullText.includes('cdn')) return 'Performance & CDN';
      if (market === 'Enterprise Software') return 'Enterprise Software';
      if (market === 'Consumer Electronics') return 'Consumer Electronics';
      if (market === 'Cloud Infrastructure') return 'Cloud & Infrastructure';
      return 'Software Solutions';
    }
    
    if (industry === 'Food & Beverage') return 'Global Beverage Brand';
    if (industry === 'Conglomerate') return 'Diversified Conglomerate';
    if (industry === 'Healthcare') return 'Healthcare';
    if (industry === 'Financial Services') return 'Financial Services';
    if (industry === 'Automotive') return 'Automotive Technology';
    if (industry === 'Energy') return 'Energy';
    if (industry === 'Retail') return 'E-commerce';
    
    return 'Professional Services';
  };
  
  const market = getMarket(bestIndustry);
  const domain = getDomain(bestIndustry, market);
  
  return {
    industry: bestIndustry,
    market,
    geography,
    domain
  };
};
