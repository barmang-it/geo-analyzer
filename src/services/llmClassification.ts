
// Main API exports - this file now acts as the main entry point
import { BusinessClassification, TestPrompt, WebsiteContent } from './classification/types';
import { extractGeographyHints } from './classification/geographyExtractor';
import { performBusinessClassification } from './classification/businessClassifier';
import { calculateGeoScore } from './classification/scoreCalculator';
import { generateTestPrompts } from './classification/promptGenerator';

export type { BusinessClassification, TestPrompt };

// Mock website content extraction for frontend (in production, this would be done server-side)
const extractBasicWebsiteInfo = async (url: string): Promise<WebsiteContent | null> => {
  // In a real implementation, this would be handled server-side
  // For now, return null to maintain existing behavior
  return null;
};

export const classifyBusiness = async (businessName: string, websiteUrl: string): Promise<BusinessClassification> => {
  // Extract geography hints from URL or business name
  const geoHints = extractGeographyHints(businessName, websiteUrl);
  
  // Try to get basic website info (this is limited in browser environment)
  const websiteContent = await extractBasicWebsiteInfo(websiteUrl);
  
  // Simulate LLM analysis with longer delay for more realistic processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Use LLM-powered business classification with website content
  const classification = await performBusinessClassification(businessName, websiteUrl, websiteContent || undefined);
  
  return {
    ...classification,
    geography: geoHints || classification.geography
  };
};

export { calculateGeoScore, generateTestPrompts };
