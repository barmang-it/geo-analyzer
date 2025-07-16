
import { AnalysisResult, BusinessClassification } from '../classification/types';
import { generateTestPrompts } from '../classification/promptGenerator';
import { calculateGeoScore } from '../classification/scoreCalculator';
import { generateDynamicStrengthsAndGaps, generateDynamicRecommendations } from './dynamicAnalysis';

export const getMockAnalysis = async (businessName: string, websiteUrl: string, reason?: string): Promise<AnalysisResult> => {
  console.log(`Generating mock analysis for ${businessName} (${reason || 'fallback'})`);
  
  const classification = performBusinessClassification(businessName, websiteUrl);
  const testPrompts = await generateTestPrompts(classification, businessName);
  const { geoScore, benchmarkScore } = calculateGeoScore(classification, businessName, testPrompts);
  
  // Generate realistic public presence based on company
  const publicPresence = generateMockPublicPresence(businessName, classification);
  
  const { strengths, gaps } = generateDynamicStrengthsAndGaps(
    classification,
    testPrompts,
    geoScore,
    true,
    4
  );
  
  const recommendations = generateDynamicRecommendations(
    classification,
    testPrompts,
    geoScore,
    true,
    4
  );
  
  return {
    businessName,
    websiteUrl,
    classification,
    testPrompts,
    geoScore,
    benchmarkScore,
    hasStructuredData: Math.random() > 0.3,
    llmMentions: testPrompts.filter(p => p.response?.includes('Mentioned')).length,
    publicPresence: publicPresence || [],
    strengths,
    gaps,
    recommendations,
    timestamp: new Date().toISOString()
  };
};

function generateMockPublicPresence(businessName: string, classification: BusinessClassification): string[] {
  const lowerName = businessName.toLowerCase();
  
  // Major tech companies
  if (lowerName.includes('microsoft') || lowerName.includes('google') || lowerName.includes('apple') || lowerName.includes('amazon')) {
    return ['Wikipedia', 'Bloomberg', 'Reuters', 'TechCrunch', 'Forbes', 'Wall Street Journal', 'LinkedIn', 'SEC Filings', 'NASDAQ'];
  }
  
  // Large beverage brands
  if (lowerName.includes('coca-cola') || lowerName.includes('pepsi') || lowerName.includes('nestle')) {
    return ['Wikipedia', 'Food & Wine', 'Beverage Industry', 'Forbes', 'Reuters', 'LinkedIn', 'SEC Filings'];
  }
  
  // Technology/Cybersecurity companies
  if (lowerName.includes('akamai') || classification.domain === 'Cybersecurity & Performance') {
    return ['Wikipedia', 'TechCrunch', 'Cybersecurity & Infrastructure Security Agency', 'IEEE', 'LinkedIn', 'NASDAQ'];
  }
  
  // Conglomerates
  if (classification.industry === 'Conglomerate') {
    return ['Wikipedia', 'Fortune', 'Harvard Business Review', 'Bloomberg', 'Wall Street Journal', 'LinkedIn'];
  }
  
  // B2B SaaS companies
  if (classification.market === 'B2B SaaS') {
    return ['LinkedIn', 'G2', 'Capterra', 'SaaS Magazine', 'TechCrunch'];
  }
  
  // Default for smaller/unknown companies
  const basePlatforms = ['LinkedIn'];
  const possiblePlatforms = ['Wikipedia', 'Local Business Directory', 'Industry Publications', 'Google My Business'];
  
  // Randomly add 1-3 additional platforms
  const additionalCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = possiblePlatforms.sort(() => 0.5 - Math.random());
  
  return [...basePlatforms, ...shuffled.slice(0, additionalCount)];
}

const performBusinessClassification = (
  businessName: string, 
  websiteUrl: string
): BusinessClassification => {
  const businessNameLower = businessName.toLowerCase();
  const urlLower = websiteUrl.toLowerCase();
  
  // PRIORITY 1: Major global beverage brands
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('coca cola') || 
      businessNameLower === 'coke' || urlLower.includes('coca-cola')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Beverages',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (businessNameLower.includes('pepsi') || businessNameLower.includes('pepsico') || 
      urlLower.includes('pepsi')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Snacks',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (businessNameLower.includes('dr pepper') || businessNameLower.includes('sprite') || 
      businessNameLower.includes('fanta') || businessNameLower.includes('mountain dew')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Beverages',
      domain: 'Global Beverage Brand'
    };
  }
  
  // Technology companies like Akamai
  if (businessNameLower.includes('akamai')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // General categories
  if (businessNameLower.includes('software') || businessNameLower.includes('saas') || 
      businessNameLower.includes('tech')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      category: 'Software & Cloud Services',
      domain: 'Software Solutions'
    };
  }
  
  // Default fallback
  return {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US',
    category: 'Software & Technology',
    domain: 'Software Solutions'
  };
};
