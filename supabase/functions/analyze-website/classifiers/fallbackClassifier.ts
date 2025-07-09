
import { BusinessClassification } from '../types.ts';

interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export function performFallbackClassification(
  businessName: string, 
  websiteUrl: string, 
  websiteContent?: WebsiteContent
): BusinessClassification {
  const businessNameLower = businessName.toLowerCase();
  const urlLower = websiteUrl.toLowerCase();
  
  // Combine website content for analysis
  let contentText = '';
  if (websiteContent) {
    contentText = `${websiteContent.title} ${websiteContent.description} ${websiteContent.content}`.toLowerCase();
  }
  
  const fullText = `${businessNameLower} ${urlLower} ${contentText}`;
  
  // PRIORITY 1: Major global tech companies
  if (businessNameLower.includes('microsoft') || urlLower.includes('microsoft')) {
    return {
      industry: 'Technology',
      market: 'Enterprise Software',
      geography: 'Global',
      domain: 'Enterprise Software'
    }
  }
  
  if (businessNameLower.includes('apple') || urlLower.includes('apple')) {
    return {
      industry: 'Technology',
      market: 'Consumer Electronics',
      geography: 'Global',
      domain: 'Consumer Electronics'
    }
  }
  
  if (businessNameLower.includes('google') || urlLower.includes('google')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cloud & Search'
    }
  }
  
  if (businessNameLower.includes('amazon') || urlLower.includes('amazon')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cloud & E-commerce'
    }
  }
  
  // PRIORITY 2: Major global beverage brands - check business name first
  if (businessNameLower.includes('coca-cola') || businessNameLower.includes('coca cola') || 
      businessNameLower === 'coke' || urlLower.includes('coca-cola')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    }
  }
  
  if (businessNameLower.includes('pepsi') || businessNameLower.includes('pepsico') || 
      urlLower.includes('pepsi')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    }
  }
  
  if (businessNameLower.includes('dr pepper') || businessNameLower.includes('sprite') || 
      businessNameLower.includes('fanta') || businessNameLower.includes('mountain dew')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    }
  }
  
  // Enhanced Akamai detection
  if (businessNameLower.includes('akamai') || 
      (fullText.includes('cdn') && fullText.includes('security')) ||
      (fullText.includes('edge') && fullText.includes('computing') && fullText.includes('performance'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // CloudFlare and similar CDN providers
  if (fullText.includes('cloudflare') || fullText.includes('cloud flare') ||
      (fullText.includes('content delivery') && fullText.includes('network'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // Enhanced security/performance detection
  if (fullText.includes('cybersecurity') || fullText.includes('ddos protection') ||
      fullText.includes('web application firewall') || fullText.includes('bot management') ||
      fullText.includes('web performance') || fullText.includes('page speed') ||
      fullText.includes('content optimization')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      domain: 'Cybersecurity & Performance'
    }
  }
  
  // General beverage detection before general keywords
  if (fullText.includes('beverage') || fullText.includes('soft drink') || fullText.includes('soda') ||
      fullText.includes('juice') || fullText.includes('energy drink') || fullText.includes('water brand') ||
      (fullText.includes('drink') && !fullText.includes('software'))) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'US',
      domain: 'Consumer Products'
    }
  }
  
  // Conglomerate detection
  const conglomerateKeywords = ['holdings', 'group', 'corporation', 'industries', 'conglomerate', 'diversified'];
  if (conglomerateKeywords.some(keyword => fullText.includes(keyword))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      domain: 'Diversified Conglomerate'
    }
  }
  
  // Technology companies
  if (fullText.includes('software') || fullText.includes('saas') || fullText.includes('platform') ||
      fullText.includes('api') || fullText.includes('cloud') || fullText.includes('developer') ||
      fullText.includes('automation') || fullText.includes('integration')) {
    return {
      industry: 'Technology',
      market: 'B2B SaaS',
      geography: 'US',
      domain: 'Software Solutions'
    }
  }
  
  // Enhanced Food & Beverage detection
  if (fullText.includes('food') || fullText.includes('restaurant') ||
      fullText.includes('snack') || fullText.includes('nutrition') ||
      fullText.includes('coffee') || fullText.includes('tea') || fullText.includes('dairy')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'US',
      domain: 'Consumer Products'
    }
  }
  
  // Healthcare
  if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('pharma') ||
      fullText.includes('clinic') || fullText.includes('hospital') || fullText.includes('wellness')) {
    return {
      industry: 'Healthcare',
      market: 'Digital Health',
      geography: 'US',
      domain: 'Healthcare'
    }
  }
  
  // Financial Services
  if (fullText.includes('bank') || fullText.includes('finance') || fullText.includes('payment') ||
      fullText.includes('fintech') || fullText.includes('investment') || fullText.includes('insurance')) {
    return {
      industry: 'Financial Services',
      market: 'Banking & Fintech',
      geography: 'US',
      domain: 'Financial Services'
    }
  }
  
  // E-commerce/Retail
  if (fullText.includes('shop') || fullText.includes('store') || fullText.includes('retail') ||
      fullText.includes('ecommerce') || fullText.includes('marketplace') || fullText.includes('buy')) {
    return {
      industry: 'Retail',
      market: 'E-commerce',
      geography: 'US',
      domain: 'E-commerce'
    }
  }
  
  // Default fallback
  return {
    industry: 'Technology',
    market: 'B2B SaaS',
    geography: 'US',
    domain: 'Software Solutions'
  }
}
