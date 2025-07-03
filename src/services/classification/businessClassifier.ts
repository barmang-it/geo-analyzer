
import { BusinessClassification, WebsiteContent } from './types';

export const performBusinessClassification = async (
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): Promise<BusinessClassification> => {
  
  // Try to get real LLM classification from the backend
  try {
    const supabaseUrl = "https://cxeyudjaehsmtmqnzklk.supabase.co"
    const functionUrl = `${supabaseUrl}/functions/v1/analyze-website`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZXl1ZGphZWhzbXRtcW56a2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA1OTUsImV4cCI6MjA2NjYxNjU5NX0.kH-nWJME9-UYvINUvPcO9DyWjVu9gVZQgc3ZxyNyPWY`
      },
      body: JSON.stringify({
        businessName,
        websiteUrl
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.classification) {
        console.log('Using real LLM classification:', result.classification)
        return result.classification
      }
    }
  } catch (error) {
    console.log('LLM classification failed, falling back to rule-based:', error)
  }
  
  // Fallback to rule-based classification only if LLM fails
  return performRuleBasedClassification(businessName, websiteUrl, websiteContent)
}

const performRuleBasedClassification = (
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
  
  // Enhanced major beverage brands detection
  if (fullText.includes('coca-cola') || fullText.includes('coke') || fullText.includes('coca cola')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Beverages',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (fullText.includes('pepsi') || fullText.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Snacks',
      domain: 'Global Beverage Brand'
    };
  }
  
  // Enhanced Akamai detection
  if (fullText.includes('akamai') || 
      (fullText.includes('cdn') && fullText.includes('security')) ||
      (fullText.includes('edge') && fullText.includes('computing') && fullText.includes('performance'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // Technology companies
  if (fullText.includes('software') || fullText.includes('saas') || fullText.includes('platform') ||
      fullText.includes('api') || fullText.includes('cloud') || fullText.includes('developer')) {
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
    category: 'Software & Cloud Services',
    domain: 'Software Solutions'
  };
}
