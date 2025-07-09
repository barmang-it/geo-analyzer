
import { BusinessClassification } from '../types.ts';
import { performIntelligentClassification } from './intelligentClassifier.ts';

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export function performFallbackClassification(
  businessName: string, 
  websiteUrl: string, 
  websiteContent?: WebsiteContent
): BusinessClassification {
  // Use the intelligent classification system instead of hardcoded rules
  return performIntelligentClassification(businessName, websiteUrl, websiteContent);
}
