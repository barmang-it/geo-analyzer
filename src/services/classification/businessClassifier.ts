
import { BusinessClassification, WebsiteContent } from './types';
import { classifyMajorBrand } from './classifiers/majorBrandsClassifier';

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
  
  // Enhanced fallback classification - check for major brands first
  return performRuleBasedClassification(businessName, websiteUrl, websiteContent)
}

const performRuleBasedClassification = (
  businessName: string, 
  websiteUrl: string,
  websiteContent?: WebsiteContent
): BusinessClassification => {
  const businessNameLower = businessName.toLowerCase();
  const urlLower = websiteUrl.toLowerCase();
  
  // Combine website content for enhanced analysis
  let contentText = '';
  if (websiteContent) {
    contentText = `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}`.toLowerCase();
  }
  
  const fullText = `${businessNameLower} ${urlLower} ${contentText}`;
  
  // PRIORITY 1: Check major brands first using the dedicated classifier
  const majorBrandResult = classifyMajorBrand(fullText);
  if (majorBrandResult) {
    return majorBrandResult;
  }
  
  // PRIORITY 2: Major global beverage brands - check business name first
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
  
  // PRIORITY 3: Technology companies like Akamai
  if (businessNameLower.includes('akamai') || 
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
  
  // PRIORITY 4: General beverage and food keywords
  if (fullText.includes('beverage') || fullText.includes('soft drink') || fullText.includes('soda') ||
      fullText.includes('juice') || fullText.includes('energy drink') || fullText.includes('water brand') ||
      (fullText.includes('drink') && !fullText.includes('software'))) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'US',
      category: 'Beverages',
      domain: 'Consumer Products'
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
  
  // Default fallback - but not for obvious beverage brands
  return {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US',
    category: 'Software & Cloud Services',
    domain: 'Software Solutions'
  };
}
