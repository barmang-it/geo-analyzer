
import { BusinessClassification, WebsiteContent } from './types';
import { classifyBeverageBrand } from './classifiers/beverageClassifier';
import { classifyTechnologyCompany } from './classifiers/technologyClassifier';
import { classifyConglomerate } from './classifiers/conglomerateClassifier';
import { classifyMajorBrand } from './classifiers/majorBrandsClassifier';
import { classifyGenericBusiness } from './classifiers/genericClassifier';

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export const performBusinessClassification = (
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): BusinessClassification => {
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Combine website content for enhanced analysis
  let contentText = '';
  if (websiteContent) {
    contentText = `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}`.toLowerCase();
  }
  
  const fullText = `${text} ${contentText}`;
  
  // Try specialized classifiers first
  let classification: BusinessClassification | null = null;
  
  // Try beverage brand classification
  classification = classifyBeverageBrand(fullText);
  if (classification) return classification;
  
  // Try technology company classification
  classification = classifyTechnologyCompany(fullText);
  if (classification) return classification;
  
  // Try conglomerate classification
  classification = classifyConglomerate(fullText);
  if (classification) return classification;
  
  // Try major brand classification
  classification = classifyMajorBrand(fullText);
  if (classification) return classification;
  
  // Fall back to generic classification
  return classifyGenericBusiness(fullText);
};
