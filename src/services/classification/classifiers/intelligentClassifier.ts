
import { BusinessClassification } from '../types';

export const performIntelligentClassification = (
  businessName: string,
  websiteUrl: string,
  websiteContent?: string
): BusinessClassification => {
  // Fallback classification - should only be used when LLM fails
  // Return generic defaults and let the LLM handle the real classification
  console.log('Using fallback classification - LLM should handle this');
  
  // Extract basic geography from URL/name
  const geography = extractBasicGeography(businessName, websiteUrl);
  
  return {
    industry: 'Enterprise Software',
    market: 'SaaS Tools', 
    geography,
    category: 'Mid-Market',
    domain: 'SaaS Tools'
  };
};

const extractBasicGeography = (businessName: string, websiteUrl: string): string => {
  const fullText = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Only check for very obvious geographic indicators
  if (fullText.includes('.co.uk') || fullText.includes('uk') || fullText.includes('london')) return 'Europe';
  if (fullText.includes('.de') || fullText.includes('.fr') || fullText.includes('europe')) return 'Europe';
  if (fullText.includes('.jp') || fullText.includes('.cn') || fullText.includes('asia')) return 'Asia Pacific';
  if (fullText.includes('global') || fullText.includes('international') || fullText.includes('worldwide')) return 'Global';
  
  return 'North America'; // Default
};
