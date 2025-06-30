export interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
  domain: string;
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
  // ... keep existing code (geography detection logic)
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
  
  // Enhanced Akamai classification
  if (text.includes('akamai')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // Enhanced major brands classification with domains
  if (text.includes('pepsi') || text.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages & Snacks',
      domain: 'Consumer Products'
    };
  }
  
  if (text.includes('coca-cola') || text.includes('coke')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages',
      domain: 'Consumer Products'
    };
  }
  
  if (text.includes('apple') && !text.includes('apple.com/developer')) {
    return {
      industry: 'Technology',
      market: 'Consumer Electronics',
      geography: 'Global',
      category: 'Consumer Technology',
      domain: 'Consumer Electronics'
    };
  }
  
  if (text.includes('microsoft')) {
    return {
      industry: 'Technology',
      market: 'Enterprise Software',
      geography: 'Global',
      category: 'Software & Cloud Services',
      domain: 'Enterprise Software'
    };
  }
  
  if (text.includes('tesla')) {
    return {
      industry: 'Automotive',
      market: 'Electric Vehicles',
      geography: 'Global',
      category: 'Electric Vehicles & Energy',
      domain: 'Automotive Technology'
    };
  }
  
  // Enhanced domain detection for cybersecurity
  if (text.includes('security') || text.includes('cyber') || text.includes('firewall') || 
      text.includes('threat') || text.includes('malware') || text.includes('encryption') ||
      text.includes('ddos') || text.includes('vulnerability') || text.includes('compliance')) {
    return {
      industry: 'Technology',
      market: 'Cybersecurity',
      geography: 'US',
      category: 'Security Solutions',
      domain: 'Cybersecurity'
    };
  }
  
  // Enhanced domain detection for specific technology areas
  if (text.includes('cdn') || text.includes('edge') || text.includes('performance') || text.includes('optimization')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'US',
      category: 'Performance Solutions',
      domain: 'Performance & CDN'
    };
  }
  
  // Enhanced industry-specific classification with domains
  if (text.includes('restaurant') || text.includes('food') || text.includes('beverage') || text.includes('drink')) {
    return {
      industry: 'Food & Beverage',
      market: 'Restaurant & Food Service',
      geography: 'US',
      category: 'Food & Dining',
      domain: 'Food Service'
    };
  }
  
  if (text.includes('bank') || text.includes('finance') || text.includes('payment') || text.includes('fintech')) {
    return {
      industry: 'Financial Services',
      market: 'Banking & Fintech',
      geography: 'US',
      category: 'Financial Technology',
      domain: 'Financial Services'
    };
  }
  
  if (text.includes('health') || text.includes('medical') || text.includes('clinic') || text.includes('pharma')) {
    return {
      industry: 'Healthcare',
      market: 'Digital Health',
      geography: 'US',
      category: 'Healthcare Technology',
      domain: 'Healthcare'
    };
  }
  
  if (text.includes('retail') || text.includes('shop') || text.includes('store') || text.includes('ecommerce')) {
    return {
      industry: 'Retail',
      market: 'E-commerce',
      geography: 'US',
      category: 'Retail & Commerce',
      domain: 'E-commerce'
    };
  }
  
  // Enhanced technology classification with more specific domains
  if (text.includes('tech') || text.includes('software') || text.includes('app') || text.includes('saas') ||
      text.includes('cloud') || text.includes('api') || text.includes('platform') || text.includes('data') ||
      text.includes('analytics') || text.includes('ai') || text.includes('ml') || 
      text.includes('infrastructure') || text.includes('computing') ||
      text.includes('digital') || text.includes('internet') || text.includes('web') || text.includes('network') ||
      text.includes('server') || text.includes('hosting')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      category: 'Software & Technology',
      domain: 'Software Solutions'
    };
  }
  
  if (text.includes('auto') || text.includes('car') || text.includes('vehicle')) {
    return {
      industry: 'Automotive',
      market: 'Auto Manufacturing',
      geography: 'US',
      category: 'Automotive',
      domain: 'Automotive'
    };
  }
  
  if (text.includes('energy') || text.includes('oil') || text.includes('gas') || text.includes('renewable')) {
    return {
      industry: 'Energy',
      market: 'Energy & Utilities',
      geography: 'US',
      category: 'Energy & Utilities',
      domain: 'Energy'
    };
  }
  
  // Default classification for unknown businesses
  return {
    industry: 'Business Services',
    market: 'Professional Services',
    geography: 'US',
    category: 'Business Services',
    domain: 'Professional Services'
  };
};

export const calculateGeoScore = (classification: BusinessClassification, businessName: string, testPrompts: TestPrompt[]): { geoScore: number; benchmarkScore: number } => {
  // Calculate mentions from test prompts - this should be the primary factor
  const mentionCount = testPrompts.filter(prompt => 
    prompt.response && prompt.response.includes('Mentioned')
  ).length;
  
  const mentionRate = testPrompts.length > 0 ? mentionCount / testPrompts.length : 0;
  
  // Base score should primarily depend on mention rate
  let baseScore = mentionRate * 6; // 0-6 points based on mention rate
  
  // Brand recognition bonus (but much smaller if no mentions)
  const globalBrands = ['pepsi', 'coca-cola', 'apple', 'microsoft', 'tesla', 'google', 'amazon', 'akamai'];
  const isGlobalBrand = globalBrands.some(brand => businessName.toLowerCase().includes(brand));
  
  if (isGlobalBrand && mentionRate > 0) {
    baseScore += 1.5; // Only give brand bonus if there are actual mentions
  } else if (isGlobalBrand && mentionRate === 0) {
    baseScore += 0.3; // Very small bonus for recognized brands with no mentions
  }
  
  // Geography scoring (reduced impact)
  if (classification.geography === 'Global' && mentionRate > 0) {
    baseScore += 0.8;
  } else if (classification.geography === 'Global') {
    baseScore += 0.2; // Small bonus even without mentions
  } else if (classification.geography === 'US' && mentionRate > 0) {
    baseScore += 0.4;
  }
  
  // Industry scoring (minimal impact)
  const highVisibilityIndustries = ['Technology', 'Food & Beverage'];
  if (highVisibilityIndustries.includes(classification.industry) && mentionRate > 0) {
    baseScore += 0.3;
  }
  
  // Add small base score for having a website and being classifiable
  baseScore += 1.0;
  
  // Small random variation for realism (-0.2 to +0.2)
  const variation = (Math.random() - 0.5) * 0.4;
  
  const finalScore = Math.max(0, Math.min(10, baseScore + variation));
  
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
  const { industry, market, geography, category, domain } = classification;
  
  // Generate domain-specific prompts based on the business domain
  const prompts: TestPrompt[] = [];
  
  if (domain === 'Cybersecurity & Performance' || domain === 'Cybersecurity') {
    prompts.push(
      {
        type: "Security Tools",
        prompt: `What are the top cybersecurity platforms for protecting against DDoS attacks ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "CDN Solutions",
        prompt: `Which content delivery networks provide the best performance optimization ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Edge Computing",
        prompt: `What are the leading edge computing platforms for web performance ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Web Security",
        prompt: `Which companies provide comprehensive web application security solutions ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Performance Solutions",
        prompt: `What are the best website performance and acceleration services available ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (domain === 'Performance & CDN') {
    prompts.push(
      {
        type: "CDN Providers",
        prompt: `What are the leading content delivery network providers ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      },
      {
        type: "Performance Tools",
        prompt: `Which platforms offer the best website performance optimization ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
      },
      {
        type: "Edge Solutions",
        prompt: `What are the top edge computing solutions for businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
      }
    );
  } else if (industry === 'Technology') {
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the leading ${domain.toLowerCase()} solutions ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
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
        prompt: `What ${domain.toLowerCase()} companies are leading innovation ${geography === 'Global' ? 'globally' : `in ${geography}`}?`
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
    // Generic prompts for other industries, but still domain-specific
    prompts.push(
      {
        type: "Top Tools",
        prompt: `What are the best ${domain.toLowerCase()} tools for businesses ${geography === 'Global' ? 'worldwide' : `in ${geography}`}?`
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
      prompt: `Can you recommend ${domain.toLowerCase()} solutions for businesses ${geography === 'Global' ? 'operating globally' : `in ${geography}`}?`
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
  // ... keep existing code (mention probability logic)
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
