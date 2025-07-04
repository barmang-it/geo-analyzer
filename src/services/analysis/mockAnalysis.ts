
import { AnalysisResult, BusinessClassification } from '../classification/types';
import { generateTestPrompts } from '../classification/promptGenerator';
import { calculateMockGeoScore } from '../classification/scoreCalculator';
import { generateDynamicStrengthsAndGaps, generateDynamicRecommendations } from './dynamicAnalysis';

export const getMockAnalysis = (
  businessName: string, 
  websiteUrl: string, 
  reason: string = 'Mock analysis'
): AnalysisResult => {
  console.log(`Using mock analysis (${reason})`);
  
  // Use the same business classification logic as the real analysis
  const classification = performMockBusinessClassification(businessName, websiteUrl);
  console.log('Mock classification result:', classification);
  
  // Generate domain-specific test prompts
  const testPrompts = generateTestPrompts(classification, businessName);
  
  // Calculate realistic mention probability based on business type and recognition
  const mentionProbability = getMockMentionProbability(businessName, classification);
  
  // Apply realistic responses to test prompts
  const processedPrompts = testPrompts.map(prompt => {
    // More sophisticated logic for determining mentions
    const shouldBeMentioned = Math.random() < mentionProbability;
    return {
      ...prompt,
      response: shouldBeMentioned ? 'mentioned' : 'not mentioned'
    };
  });
  
  const llmMentions = processedPrompts.filter(p => p.response === 'mentioned').length;
  const geoScore = calculateMockGeoScore(classification, llmMentions, false);
  
  // Generate dynamic content
  const { strengths, gaps } = generateDynamicStrengthsAndGaps(classification, geoScore, llmMentions > 3);
  const recommendations = generateDynamicRecommendations(classification, geoScore, gaps);
  
  return {
    businessName,
    websiteUrl,
    classification,
    testPrompts: processedPrompts,
    geoScore,
    benchmarkScore: getBenchmarkScore(classification),
    llmMentions,
    hasStructuredData: Math.random() > 0.7, // Random but realistic
    publicPresence: generatePublicPresence(businessName, classification),
    strengths,
    gaps,
    recommendations,
    timestamp: new Date().toISOString()
  };
};

const performMockBusinessClassification = (
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

const getMockMentionProbability = (
  businessName: string, 
  classification: BusinessClassification
): number => {
  const businessNameLower = businessName.toLowerCase();
  
  // Major global brands have higher mention probability
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('pepsi')) {
    return 0.85; // Very high for major beverage brands
  }
  
  if (businessNameLower.includes('akamai')) {
    return 0.70; // High for well-known tech companies
  }
  
  // Geography affects mention probability
  if (classification.geography === 'Global') {
    return 0.60;
  } else if (classification.geography === 'US') {
    return 0.40;
  }
  
  // Default for smaller/regional companies
  return 0.25;
};

const getBenchmarkScore = (classification: BusinessClassification): number => {
  // Benchmark scores vary by industry and market
  if (classification.domain === 'Global Beverage Brand') {
    return 8.5; // High benchmark for major beverage brands
  }
  
  if (classification.domain === 'Cybersecurity & Performance') {
    return 7.2; // High for tech infrastructure companies
  }
  
  if (classification.market === 'B2B SaaS') {
    return 6.8; // Medium for SaaS companies
  }
  
  return 6.5; // Default benchmark
};

const generatePublicPresence = (
  businessName: string, 
  classification: BusinessClassification
): string[] => {
  const platforms = ['Website', 'LinkedIn'];
  
  // Major brands have more presence
  if (classification.domain === 'Global Beverage Brand') {
    platforms.push('Twitter', 'Facebook', 'Instagram', 'Wikipedia');
  } else if (classification.geography === 'Global') {
    platforms.push('Twitter', 'Wikipedia');
  } else if (classification.market === 'B2B SaaS') {
    platforms.push('Twitter', 'Product Hunt');
  }
  
  return platforms;
};
