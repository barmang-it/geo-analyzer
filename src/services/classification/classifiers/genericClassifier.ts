
import { BusinessClassification } from '../types';

export const classifyGenericBusiness = (fullText: string): BusinessClassification => {
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
  
  // Enhanced Food & Beverage detection
  if (fullText.includes('food') || fullText.includes('beverage') || fullText.includes('drink') ||
      fullText.includes('restaurant') || fullText.includes('snack') || fullText.includes('nutrition') ||
      fullText.includes('soda') || fullText.includes('juice') || fullText.includes('water') ||
      fullText.includes('coffee') || fullText.includes('tea') || fullText.includes('dairy')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'US',
      category: 'Food & Beverages',
      domain: 'Consumer Products'
    };
  }
  
  if (fullText.includes('auto') || fullText.includes('car') || fullText.includes('vehicle')) {
    return {
      industry: 'Automotive',
      market: 'Auto Manufacturing',
      geography: 'US',
      category: 'Automotive',
      domain: 'Automotive'
    };
  }
  
  if (fullText.includes('energy') || fullText.includes('oil') || fullText.includes('gas') || fullText.includes('renewable')) {
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
