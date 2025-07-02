
interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
  domain: string;
}

export const performBusinessClassification = (businessName: string, websiteUrl: string): BusinessClassification => {
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Enhanced conglomerate detection
  const conglomerateKeywords = ['holdings', 'group', 'corporation', 'industries', 'conglomerate', 'diversified'];
  const isConglomerate = conglomerateKeywords.some(keyword => text.includes(keyword));
  
  // Major conglomerates with specific classification
  if (text.includes('reliance') && (text.includes('industries') || text.includes('ril'))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Petrochemicals, Retail & Telecom',
      domain: 'Diversified Conglomerate'
    };
  }
  
  if (text.includes('berkshire') && text.includes('hathaway')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Insurance, Energy & Consumer Goods',
      domain: 'Investment Conglomerate'
    };
  }
  
  if (text.includes('general') && text.includes('electric')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Healthcare & Aviation',
      domain: 'Industrial Conglomerate'
    };
  }
  
  if (text.includes('samsung') && !text.includes('electronics')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Electronics, Heavy Industries & Financial Services',
      domain: 'Technology Conglomerate'
    };
  }
  
  if (text.includes('siemens')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Industrial Automation, Energy & Healthcare',
      domain: 'Industrial Technology Conglomerate'
    };
  }
  
  if (text.includes('tata') && (text.includes('group') || text.includes('sons'))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Steel, Automotive, IT Services & Consumer Goods',
      domain: 'Diversified Business Group'
    };
  }
  
  // Generic conglomerate detection
  if (isConglomerate) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'US',
      category: 'Diversified Holdings',
      domain: 'Business Conglomerate'
    };
  }
  
  // Enhanced Akamai classification - check first before generic tech classification
  if (text.includes('akamai')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // CloudFlare classification
  if (text.includes('cloudflare') || text.includes('cloud flare')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
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
  
  // Enhanced domain detection for cybersecurity and CDN companies
  if (text.includes('security') || text.includes('cyber') || text.includes('firewall') || 
      text.includes('threat') || text.includes('malware') || text.includes('encryption') ||
      text.includes('ddos') || text.includes('vulnerability') || text.includes('compliance') ||
      text.includes('cdn') || text.includes('edge') || text.includes('content delivery')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'US',
      category: 'Security & Performance Solutions',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // Enhanced domain detection for specific technology areas
  if (text.includes('performance') || text.includes('optimization') || text.includes('acceleration')) {
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
