
export interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
}

export interface TestPrompt {
  type: string;
  prompt: string;
  response?: string;
}

export const classifyBusiness = async (businessName: string, websiteUrl: string): Promise<BusinessClassification> => {
  // In production, this would use actual LLM APIs
  // For now, we'll simulate intelligent classification
  
  // Extract geography hints from URL or business name
  const geoHints = extractGeographyHints(businessName, websiteUrl);
  
  // Simulate LLM analysis
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock classification based on business name patterns
  const classification = simulateClassification(businessName, websiteUrl);
  
  return {
    ...classification,
    geography: geoHints || classification.geography
  };
};

const extractGeographyHints = (businessName: string, websiteUrl: string): string => {
  const geoKeywords = {
    'US': ['.com', 'america', 'usa', 'united states', 'california', 'new york', 'texas'],
    'UK': ['.co.uk', 'london', 'britain', 'england', 'uk'],
    'EU': ['.de', '.fr', '.es', '.it', 'europe', 'berlin', 'paris'],
    'Global': ['international', 'worldwide', 'global']
  };
  
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  for (const [region, keywords] of Object.entries(geoKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return region;
    }
  }
  
  return 'US'; // Default
};

const simulateClassification = (businessName: string, websiteUrl: string): BusinessClassification => {
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  if (text.includes('tech') || text.includes('software') || text.includes('app')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      category: 'Software & Technology'
    };
  }
  
  if (text.includes('finance') || text.includes('bank') || text.includes('payment')) {
    return {
      industry: 'Financial Services',
      market: 'Fintech',
      geography: 'US',
      category: 'Financial Technology'
    };
  }
  
  if (text.includes('health') || text.includes('medical') || text.includes('clinic')) {
    return {
      industry: 'Healthcare',
      market: 'Digital Health',
      geography: 'US',
      category: 'Healthcare Technology'
    };
  }
  
  if (text.includes('retail') || text.includes('shop') || text.includes('store')) {
    return {
      industry: 'Retail',
      market: 'E-commerce',
      geography: 'US',
      category: 'Retail & Commerce'
    };
  }
  
  // Default classification
  return {
    industry: 'Technology',
    market: 'B2B Services',
    geography: 'US',
    category: 'Business Services'
  };
};

export const generateTestPrompts = (classification: BusinessClassification, businessName: string): TestPrompt[] => {
  const { industry, market, geography, category } = classification;
  
  return [
    {
      type: "Top Tools",
      prompt: `What are the best ${industry.toLowerCase()} tools for small businesses in ${geography}?`
    },
    {
      type: "Alternatives",
      prompt: `What are some alternatives to popular ${market.toLowerCase()} solutions for ${industry.toLowerCase()}?`
    },
    {
      type: "Use Case Match",
      prompt: `Which platforms help ${industry.toLowerCase()} companies manage their operations in ${geography}?`
    },
    {
      type: "Trends",
      prompt: `What ${category.toLowerCase()} tools are gaining traction in ${geography}?`
    },
    {
      type: "Feature Targeted",
      prompt: `What tools provide automation features for ${market.toLowerCase()} companies?`
    },
    {
      type: "Recommendation",
      prompt: `Can you recommend ${industry.toLowerCase()} software for a growing business in ${geography}?`
    },
    {
      type: "Comparison",
      prompt: `Compare the leading ${category.toLowerCase()} solutions available in ${geography}.`
    }
  ];
};
