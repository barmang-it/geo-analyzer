interface BusinessClassification {
  industry: string;
  market: string;
  geography: string;
  category: string;
  domain: string;
}

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
  
  // Enhanced Akamai detection with website content
  if (fullText.includes('akamai') || 
      (fullText.includes('cdn') && fullText.includes('security')) ||
      (fullText.includes('edge') && fullText.includes('computing') && fullText.includes('performance')) ||
      (fullText.includes('content delivery') && fullText.includes('ddos'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // CloudFlare and similar CDN providers
  if (fullText.includes('cloudflare') || fullText.includes('cloud flare') ||
      (fullText.includes('content delivery') && fullText.includes('network'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // Enhanced conglomerate detection
  const conglomerateKeywords = ['holdings', 'group', 'corporation', 'industries', 'conglomerate', 'diversified'];
  const isConglomerate = conglomerateKeywords.some(keyword => fullText.includes(keyword));
  
  // Major conglomerates with specific classification
  if (fullText.includes('reliance') && (fullText.includes('industries') || fullText.includes('ril'))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Petrochemicals, Retail & Telecom',
      domain: 'Diversified Conglomerate'
    };
  }
  
  if (fullText.includes('berkshire') && fullText.includes('hathaway')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Insurance, Energy & Consumer Goods',
      domain: 'Investment Conglomerate'
    };
  }
  
  if (fullText.includes('general') && fullText.includes('electric')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Healthcare & Aviation',
      domain: 'Industrial Conglomerate'
    };
  }
  
  if (fullText.includes('samsung') && !fullText.includes('electronics')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Electronics, Heavy Industries & Financial Services',
      domain: 'Technology Conglomerate'
    };
  }
  
  if (fullText.includes('siemens')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Industrial Automation, Energy & Healthcare',
      domain: 'Industrial Technology Conglomerate'
    };
  }
  
  if (fullText.includes('tata') && (fullText.includes('group') || fullText.includes('sons'))) {
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
  
  // Enhanced major brands classification with content analysis
  if (fullText.includes('pepsi') || fullText.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages & Snacks',
      domain: 'Consumer Products'
    };
  }
  
  if (fullText.includes('coca-cola') || fullText.includes('coke')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Beverages',
      domain: 'Consumer Products'
    };
  }
  
  if (fullText.includes('apple') && !fullText.includes('apple.com/developer')) {
    return {
      industry: 'Technology',
      market: 'Consumer Electronics',
      geography: 'Global',
      category: 'Consumer Technology',
      domain: 'Consumer Electronics'
    };
  }
  
  if (fullText.includes('microsoft')) {
    return {
      industry: 'Technology',
      market: 'Enterprise Software',
      geography: 'Global',
      category: 'Software & Cloud Services',
      domain: 'Enterprise Software'
    };
  }
  
  if (fullText.includes('tesla')) {
    return {
      industry: 'Automotive',
      market: 'Electric Vehicles',
      geography: 'Global',
      category: 'Electric Vehicles & Energy',
      domain: 'Automotive Technology'
    };
  }
  
  // Enhanced domain detection using website content
  if (fullText.includes('security') || fullText.includes('cyber') || fullText.includes('firewall') || 
      fullText.includes('threat') || fullText.includes('malware') || fullText.includes('encryption') ||
      fullText.includes('ddos') || fullText.includes('vulnerability') || fullText.includes('compliance') ||
      fullText.includes('web application firewall') || fullText.includes('bot management') ||
      fullText.includes('edge computing') || fullText.includes('content optimization')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'US',
      category: 'Security & Performance Solutions',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // Enhanced performance and CDN detection
  if (fullText.includes('performance') || fullText.includes('optimization') || fullText.includes('acceleration') ||
      fullText.includes('page speed') || fullText.includes('web performance') || fullText.includes('load time')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'US',
      category: 'Performance Solutions',
      domain: 'Performance & CDN'
    };
  }
  
  // Enhanced technology classification using website content
  if (fullText.includes('software') || fullText.includes('saas') || fullText.includes('platform') ||
      fullText.includes('api') || fullText.includes('developer') || fullText.includes('integration') ||
      fullText.includes('automation') || fullText.includes('workflow') || fullText.includes('dashboard') ||
      fullText.includes('analytics') || fullText.includes('data') || fullText.includes('artificial intelligence') ||
      fullText.includes('machine learning') || fullText.includes('cloud computing')) {
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
