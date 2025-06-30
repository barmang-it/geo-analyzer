
import { BusinessClassification, TestPrompt } from './types';

export const calculateGeoScore = (
  classification: BusinessClassification, 
  businessName: string, 
  testPrompts: TestPrompt[]
): { geoScore: number; benchmarkScore: number } => {
  // Calculate mentions from test prompts - this should be the primary factor
  const mentionCount = testPrompts.filter(prompt => 
    prompt.response && prompt.response.includes('Mentioned')
  ).length;
  
  const mentionRate = testPrompts.length > 0 ? mentionCount / testPrompts.length : 0;
  
  // Base score should primarily depend on mention rate
  let baseScore = mentionRate * 6; // 0-6 points based on mention rate
  
  // Brand recognition bonus (but much smaller if no mentions)
  const globalBrands = ['pepsi', 'coca-cola', 'apple', 'microsoft', 'tesla', 'google', 'amazon', 'akamai'];
  const isGlobalBrand = globalBrands.some(brand => businessName.toLowerCase().includes(brand));
  
  if (isGlobalBrand && mentionRate > 0) {
    baseScore += 1.5; // Only give brand bonus if there are actual mentions
  } else if (isGlobalBrand && mentionRate === 0) {
    baseScore += 0.3; // Very small bonus for recognized brands with no mentions
  }
  
  // Geography scoring (reduced impact)
  if (classification.geography === 'Global' && mentionRate > 0) {
    baseScore += 0.8;
  } else if (classification.geography === 'Global') {
    baseScore += 0.2; // Small bonus even without mentions
  } else if (classification.geography === 'US' && mentionRate > 0) {
    baseScore += 0.4;
  }
  
  // Industry scoring (minimal impact)
  const highVisibilityIndustries = ['Technology', 'Food & Beverage'];
  if (highVisibilityIndustries.includes(classification.industry) && mentionRate > 0) {
    baseScore += 0.3;
  }
  
  // Add small base score for having a website and being classifiable
  baseScore += 1.0;
  
  // Small random variation for realism (-0.2 to +0.2)
  const variation = (Math.random() - 0.5) * 0.4;
  
  const finalScore = Math.max(0, Math.min(10, baseScore + variation));
  
  // Calculate benchmark score based on category
  const benchmarkScores = {
    'Food & Beverage': 7.2,
    'Technology': 6.8,
    'Healthcare': 6.1,
    'Financial Services': 6.5,
    'Retail': 6.3,
    'Automotive': 6.7,
    'Energy': 5.9,
    'Business Services': 5.5
  };
  
  const benchmarkScore = benchmarkScores[classification.industry] || 6.0;
  const benchmarkVariation = (Math.random() - 0.5) * 0.4; // Small variation
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round((benchmarkScore + benchmarkVariation) * 10) / 10
  };
};

const getMentionProbability = (businessName: string, classification: BusinessClassification): number => {
  const globalBrands = ['pepsi', 'coca-cola', 'apple', 'microsoft', 'tesla', 'google', 'amazon', 'akamai'];
  const isGlobalBrand = globalBrands.some(brand => businessName.toLowerCase().includes(brand));
  
  if (isGlobalBrand) {
    return 0.8; // 80% chance for global brands
  }
  
  if (classification.geography === 'Global') {
    return 0.6; // 60% for other global companies
  }
  
  if (classification.geography === 'US') {
    return 0.4; // 40% for US companies
  }
  
  return 0.2; // 20% for regional companies
};

export { getMentionProbability };
