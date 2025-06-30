
import { BusinessClassification } from './types';

export const performBusinessClassification = (businessName: string, websiteUrl: string): BusinessClassification => {
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
