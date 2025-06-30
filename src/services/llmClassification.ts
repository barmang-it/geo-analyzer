
// Main API exports - this file now acts as the main entry point
import { BusinessClassification, TestPrompt } from './classification/types';
import { extractGeographyHints } from './classification/geographyExtractor';
import { performBusinessClassification } from './classification/businessClassifier';
import { calculateGeoScore } from './classification/scoreCalculator';
import { generateTestPrompts } from './classification/promptGenerator';

export type { BusinessClassification, TestPrompt };

export const classifyBusiness = async (businessName: string, websiteUrl: string): Promise<BusinessClassification> => {
  // In production, this would use actual LLM APIs
  // For now, we'll simulate more intelligent classification
  
  // Extract geography hints from URL or business name
  const geoHints = extractGeographyHints(businessName, websiteUrl);
  
  // Simulate LLM analysis with longer delay for more realistic processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Use more sophisticated business classification
  const classification = performBusinessClassification(businessName, websiteUrl);
  
  return {
    ...classification,
    geography: geoHints || classification.geography
  };
};

export { calculateGeoScore, generateTestPrompts };
