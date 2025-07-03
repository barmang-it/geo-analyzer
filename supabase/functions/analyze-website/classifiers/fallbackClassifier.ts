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
  const text = `${businessName} ${websiteUrl}`.toLowerCase();
  
  // Combine website content for analysis
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
      domain: 'Global Beverage Brand'
    }
  }
  
  if (fullText.includes('pepsi') || fullText.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    }
  }
  
  if (fullText.includes('dr pepper') || fullText.includes('sprite') || fullText.includes('fanta')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      domain: 'Global Beverage Brand'
    }
  }
  
  // Enhanced Akamai detection
  if (fullText.includes('akamai') || 
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
  if (fullText.includes('food') || fullText.includes('beverage') || fullText.includes('restaurant') ||
      fullText.includes('drink') || fullText.includes('snack') || fullText.includes('nutrition') ||
      fullText.includes('soda') || fullText.includes('juice') || fullText.includes('water') ||
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
