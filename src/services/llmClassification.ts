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

const extractGeographyHints = (businessName: string, websiteUrl: string): string => {
  const geoKeywords = {
    'Global': ['global', 'international', 'worldwide', 'pepsi', 'coca-cola', 'mcdonalds', 'apple', 'microsoft', 'google', 'akamai'],
    'US': ['.com', 'america', 'usa', 'united states', 'california', 'new york', 'texas', 'inc', 'corp'],
    'UK': ['.co.uk', 'london', 'britain', 'england', 'uk', 'ltd'],
    'EU': ['.de', '.fr', '.es', '.it', 'europe', 'berlin', 'paris', 'gmbh']
  };
  
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  for (const [region, keywords] of Object.entries(geoKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return region;
    }
  }
  
  return 'US'; // Default
};

const performBusinessClassification = (businessName: string, websiteUrl: string): BusinessClassification => {
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Major technology companies classification
  if (text.includes('akamai')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN & Edge Computing'
    };
  }
  
  // Major brands classification
  if (text.includes('pepsi') || text.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages & Snacks'
    };
  }
  
  if (text.includes('coca-cola') || text.includes('coke')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages'
    };
  }
  
  if (text.includes('apple') && !text.includes('apple.com/developer')) {
    return {
      industry: 'Technology',
      market: 'Consumer Electronics',
      geography: 'Global',
      category: 'Consumer Technology'
    };
  }
  
  if (text.includes('microsoft')) {
    return {
      industry: 'Technology',
      market: 'Enterprise Software',
      geography: 'Global',
      category: 'Software & Cloud Services'
    };
  }
  
  if (text.includes('tesla')) {
    return {
      industry: 'Automotive',
      market: 'Electric Vehicles',
      geography: 'Global',
      category: 'Electric Vehicles & Energy'
    };
  }
  
  // Industry-specific classification with enhanced technology detection
  if (text.includes('restaurant') || text.includes('food') || text.includes('beverage') || text.includes('drink')) {
    return {
      industry: 'Food & Beverage',
      market: 'Restaurant & Food Service',
      geography: 'US',
      category: 'Food & Dining'
    };
  }
  
  if (text.includes('bank') || text.includes('finance') || text.includes('payment') || text.includes('fintech')) {
    return {
      industry: 'Financial Services',
      market: 'Banking & Fintech',
      geography: 'US',
      category: 'Financial Technology'
    };
  }
  
  if (text.includes('health') || text.includes('medical') || text.includes('clinic') || text.includes('pharma')) {
    return {
      industry: 'Healthcare',
      market: 'Digital Health',
      geography: 'US',
      category: 'Healthcare Technology'
    };
  }
  
  if (text.includes('retail') || text.includes('shop') || text.includes('store') || text.includes('ecommerce')) {
    return {
      industry: 'Retail',
      market: 'E-commerce',
      geography: 'US',
      category: 'Retail & Commerce'
    };
  }
  
  // Enhanced technology classification with more keywords
  if (text.includes('tech') || text.includes('software') || text.includes('app') || text.includes('saas') ||
      text.includes('cloud') || text.includes('api') || text.includes('platform') || text.includes('data') ||
      text.includes('analytics') || text.includes('ai') || text.includes('ml') || text.includes('cyber') ||
      text.includes('security') || text.includes('infrastructure') || text.includes('computing') ||
      text.includes('digital') || text.includes('internet') || text.includes('web') || text.includes('network') ||
      text.includes('server') || text.includes('hosting') || text.includes('cdn') || text.includes('edge')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      category: 'Software & Technology'
    };
  }
  
  if (text.includes('auto') || text.includes('car') || text.includes('vehicle')) {
    return {
      industry: 'Automotive',
      market: 'Auto Manufacturing',
      geography: 'US',
      category: 'Automotive'
    };
  }
  
  if (text.includes('energy') || text.includes('oil') || text.includes('gas') || text.includes('renewable')) {
    return {
      industry: 'Energy',
      market: 'Energy & Utilities',
      geography: 'US',
      category: 'Energy & Utilities'
    };
  }
  
  // Default classification for unknown businesses
  return {
    industry: 'Business Services',
    market: 'Professional Services',
    geography: 'US',
    category: 'Business Services'
  };
};

export const calculateGeoScore = (classification: BusinessClassification, businessName: string, testPrompts: TestPrompt[]): { geoScore: number; benchmarkScore: number } => {
  let baseScore = 5.0; // Starting baseline
  
  // Score adjustments based on business classification
  const globalBrands = ['pepsi', 'coca-cola', 'apple', 'microsoft', 'tesla', 'google', 'amazon', 'akamai'];
  const isGlobalBrand = globalBrands.some(brand => businessName.toLowerCase().includes(brand));
  
  if (isGlobalBrand) {
    baseScore += 2.5; // Global brands get higher base score
  }
  
  // Geography scoring
  if (classification.geography === 'Global') {
    baseScore += 1.0;
  } else if (classification.geography === 'US') {
    baseScore += 0.5;
  }
  
  // Industry scoring
  const highVisibilityIndustries = ['Technology', 'Food & Beverage'];
  if (highVisibilityIndustries.includes(classification.industry)) {
    baseScore += 0.5;
  }
  
  // Calculate mentions from test prompts
  const mentionCount = testPrompts.filter(prompt => 
    prompt.response && prompt.response.includes('Mentioned')
  ).length;
  
  const mentionScore = (mentionCount / testPrompts.length) * 2; // Max 2 points from mentions
  
  // Random variation for realism (-0.5 to +0.5)
  const variation = (Math.random() - 0.5);
  
  const finalScore = Math.max(0, Math.min(10, baseScore + mentionScore + variation));
  
  // Calculate benchmark score based on category
  const benchmarkScores = {
    'Food & Beverage': 7.2,
    'Technology': 6.8,
    'Healthcare': 6.1,
    'Financial Services': 6.5,
    'Retail': 6.3,
    'Automotive': 6.7,
    'Energy': 5.9,
    'Business Services': 5.5
  };
  
  const benchmarkScore = benchmarkScores[classification.industry] || 6.0;
  const benchmarkVariation = (Math.random() - 0.5) * 0.4; // Small variation
  
  return {
    geoScore: Math.round(finalScore * 10) / 10,
    benchmarkScore: Math.round((benchmarkScore + benchmarkVariation) * 10) / 10
  };
};

export const generateTestPrompts = (classification: BusinessClassification, businessName: string): TestPrompt[] => {
  const { industry, market, geography, category } = classification;
  
  // Generate more specific prompts based on the classification
  const prompts: TestPrompt[] = [];
  
  if (industry === 'Technology') {
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the leading ${category.toLowerCase()} solutions ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to popular ${market.toLowerCase()} platforms?`
      },
      {
        type: "Market Leaders",
        prompt: `Which companies dominate the ${category.toLowerCase()} space ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Industry Trends",
        prompt: `What ${industry.toLowerCase()} companies are leading innovation ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Use Case Match",
        prompt: `Which platforms help businesses with ${market.toLowerCase()} needs ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (industry === 'Food & Beverage') {
    prompts.push(
      {
        type: "Top Brands",
        prompt: `What are the most popular beverage brands ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to Coca-Cola for ${market.toLowerCase()} companies?`
      },
      {
        type: "Market Leaders",
        prompt: `Which companies dominate the ${category.toLowerCase()} market ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Industry Trends",
        prompt: `What ${industry.toLowerCase()} brands are trending ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Comparison",
        prompt: `Compare the leading ${category.toLowerCase()} brands available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}.`
      }
    );
  } else {
    // Generic prompts for other industries
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the best ${industry.toLowerCase()} tools for businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Alternatives",
        prompt: `What are some alternatives to popular ${market.toLowerCase()} solutions?`
      },
      {
        type: "Use Case Match",
        prompt: `Which platforms help ${industry.toLowerCase()} companies manage their operations ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Trends",
        prompt: `What ${category.toLowerCase()} tools are gaining traction ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Feature Targeted",
        prompt: `What tools provide automation features for ${market.toLowerCase()} companies?`
      }
    );
  }
  
  // Add recommendation and comparison prompts
  prompts.push(
    {
      type: "Recommendation",
      prompt: `Can you recommend ${industry.toLowerCase()} solutions for businesses ${geography === 'Global' ? 'operating globally' : `in ${geography}`}?`
    },
    {
      type: "Comparison",
      prompt: `Compare the leading ${category.toLowerCase()} solutions available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}.`
    }
  );
  
  // Simulate responses with realistic mention probability
  const mentionProbability = getMentionProbability(businessName, classification);
  
  return prompts.map(prompt => ({
    ...prompt,
    response: Math.random() < mentionProbability ? 
      `Analyzed for ${businessName} - Mentioned` : 
      `Analyzed for ${businessName} - Not mentioned`
  }));
};

const getMentionProbability = (businessName: string, classification: BusinessClassification): number => {
  const globalBrands = ['pepsi', 'coca-cola', 'apple', 'microsoft', 'tesla', 'google', 'amazon', 'akamai'];
  const isGlobalBrand = globalBrands.some(brand => businessName.toLowerCase().includes(brand));
  
  if (isGlobalBrand) {
    return 0.8; // 80% chance for global brands
  }
  
  if (classification.geography === 'Global') {
    return 0.6; // 60% for other global companies
  }
  
  if (classification.geography === 'US') {
    return 0.4; // 40% for US companies
  }
  
  return 0.2; // 20% for regional companies
};
