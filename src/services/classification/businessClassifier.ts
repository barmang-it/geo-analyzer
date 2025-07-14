
import { supabase } from '@/integrations/supabase/client';
import { BusinessClassification, WebsiteContent } from './types';
import { performIntelligentClassification } from './classifiers/intelligentClassifier';

export const performBusinessClassification = async (
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): Promise<BusinessClassification> => {
  
  // Try to get real LLM classification from the backend
  try {
    const { data, error } = await supabase.functions.invoke('analyze-website', {
      body: {
        businessName,
        websiteUrl
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data?.classification) {
      console.log('Using real LLM classification:', data.classification);
      return data.classification;
    }
  } catch (error) {
    console.log('LLM classification failed, falling back to intelligent classifier:', error);
  }
  
  // Use intelligent classification system
  const contentText = websiteContent ? 
    `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}` : '';
  
  return performIntelligentClassification(businessName, websiteUrl, contentText);
};
