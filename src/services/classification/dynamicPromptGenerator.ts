
import { supabase } from '@/integrations/supabase/client';
import { BusinessClassification, TestPrompt } from './types';

export const generateDynamicTestPrompts = async (
  classification: BusinessClassification, 
  businessName: string
): Promise<TestPrompt[]> => {
  const { industry, market, geography, category, domain } = classification;
  
  try {
    // Use the existing Supabase function to generate prompts via ChatGPT
    const { data, error } = await supabase.functions.invoke('generate-test-prompts', {
      body: {
        classification,
        businessName
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data?.prompts && Array.isArray(data.prompts)) {
      return data.prompts;
    }
  } catch (error) {
    console.log('Dynamic prompt generation failed, using fallback prompts:', error);
  }
  
  // Fallback to basic prompts if ChatGPT generation fails
  return generateFallbackPrompts(classification);
};

const generateFallbackPrompts = (classification: BusinessClassification): TestPrompt[] => {
  const { industry, market, geography, domain } = classification;
  const geoText = geography === 'Global' ? 'worldwide' : `in ${geography}`;
  
  return [
    {
      type: "Industry Leaders",
      prompt: `What are the top companies in the ${industry.toLowerCase()} industry ${geoText}?`
    },
    {
      type: "Market Analysis",
      prompt: `Which companies dominate the ${market.toLowerCase()} market ${geoText}?`
    },
    {
      type: "Business Solutions",
      prompt: `What are the best ${domain.toLowerCase()} solutions available ${geoText}?`
    },
    {
      type: "Competitive Landscape",
      prompt: `Who are the main competitors in ${industry.toLowerCase()} ${geoText}?`
    },
    {
      type: "Industry Innovation",
      prompt: `Which companies are leading innovation in ${industry.toLowerCase()} ${geoText}?`
    },
    {
      type: "Service Providers",
      prompt: `What companies provide ${domain.toLowerCase()} services ${geoText}?`
    },
    {
      type: "Market Recommendations",
      prompt: `Recommend top ${industry.toLowerCase()} companies for ${market.toLowerCase()} ${geoText}.`
    }
  ];
};
